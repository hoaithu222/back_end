import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { z } from 'zod';
import { query } from 'express';
import { error } from 'console';
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  async create(@Body() body: CreateProductDto, @Res() res) {
    try {
      const schema = z.object({
        shop_id: z.number({
          required_error: 'ID cửa hàng bắt buộc phải nhập',
        }),
        subcategory_id: z.number({
          required_error: 'ID danh mục con bắt buộc phải nhập',
        }),
        name: z.string({
          required_error: 'Tên bắt buộc phải nhập',
        }),
        description: z.string({
          required_error: 'Mô tả bắt buộc phải nhập',
        }),
        base_price: z.number({
          required_error: 'Giá tiền bắt buộc phải nhập',
        }),
        stock_quantity: z.number({
          required_error: 'Số lượng bắt buộc phải nhập',
        }),

        rating: z.number().optional().default(0),
        sales_count: z.number().optional().default(0),
        is_active: z.boolean().optional().default(true),
        product_attributes: z.array(
          z.object({
            attribute_value_id: z.number(),
          }),
        ),
        product_images: z.array(
          z.object({
            image_url: z.string(),
            display_order: z.number(),
            is_thumbnail: z.boolean(),
          }),
        ),
        product_variants: z.array(
          z.object({
            sku: z.string(),
            combination: z.record(z.string()),
            price: z.number(),
            stock: z.number(),
            image_url: z.string().nullable(),
          }),
        ),
      });
      const validateFields = await schema.safeParseAsync(body);
      if (!validateFields.success) {
        const errors = validateFields.error.flatten().fieldErrors;
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          errors,
          error: true,
          message: 'Validate failed',
        });
      }
      const uniqueAttributes = Array.from(
        new Set(body.product_attributes.map((attr) => attr.attribute_value_id)),
      ).map((id) => ({ attribute_value_id: id }));

      body.product_attributes = uniqueAttributes;
      const result = await this.productsService.create(body);

      return res.status(HttpStatus.CREATED).json({
        message: 'Đã thêm sản phẩm thành công',
        success: true,
        error: false,
        data: result,
      });
    } catch (error) {
      return res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        message:
          error.message || 'Đã xảy ra lỗi với server vui lòng thử lại sau',
        error: true,
        success: false,
      });
    }
  }

  @Get()
  async findAll(@Query() query, @Res() res) {
    const {
      _page = 1,
      _limit = 8,
      _order = 'asc',
      _sort = 'id',
      filter_name,
      name_like,
      q,
      shop_id,
    } = query;
    const filter = {} as { [key: string]: string | boolean | {} };
    if (filter_name) {
      filter.name = filter_name;
    }
    if (name_like) {
      filter.name = {
        contains: name_like,
        mode: 'insensitive',
      };
    }
    if (q) {
      filter.OR = [
        {
          name: {
            contains: name_like,
            mode: 'insensitive',
          },
        },
      ];
    }
    if (shop_id) {
      filter.shop_id = +shop_id;
    }
    try {
      const { rows, count } = await this.productsService.findAll({
        page: +_page,
        limit: +_limit,
        sort: _sort,
        order: _order,
        filter,
      });
      return res.status(HttpStatus.ACCEPTED).json({
        message: 'Đã lấy danh sách sản phẩm thành công',
        error: false,
        success: true,
        count: count,
        data: rows,
        current_page: _page,
      });
    } catch (error) {
      return res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        message: error.message || 'Đã xảy ra lỗi',
        error: true,
        success: false,
      });
    }
  }
  @Post('/sub-category')
  async getProductWithSubCategory(@Query() query, @Body() body, @Res() res) {
    const { _page = 1, _limit = 8, _order = 'asc', _sort = 'id' } = query;

    try {
      const { rows, count } =
        await this.productsService.getProductWithSubCategory({
          page: +_page,
          limit: +_limit,
          order: _order,
          sort: _sort,
          body,
        });
      return res.status(HttpStatus.ACCEPTED).json({
        message: 'Lấy danh sách sản phẩm thành công',
        error: false,
        success: true,
        data: rows,
        count: count,
        currentPage: +_page,
      });
    } catch (error) {
      return res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        message: error.message || 'Đã xảy ra lỗi',
        error: true,
        success: false,
      });
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Res() res) {
    try {
      const productId = await this.productsService.findOne(+id);
      if (!productId) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: 'Lỗi khi lấy dữ liệu từ server',
          error: true,
          success: false,
        });
      }
      return res.status(HttpStatus.ACCEPTED).json({
        message: `Đã lấy product id ${id} thành công`,
        error: false,
        success: true,
        data: productId,
      });
    } catch (error) {
      return res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        message: error.message || 'Đã xảy ra lỗi vui lòng thử lại sau',
        error: true,
        success: false,
      });
    }
  }
  @Get('/shopId/:id')
  async getProductByShop(@Res() res, @Param('id') id: string, @Query() query) {
    const { _page = 1, _limit = 3, q, _sort = 'id', _order = 'asc' } = query;

    const filter = {} as { [key: string]: string | boolean | {} };
    if (q) {
      filter.OR = [
        {
          name: {
            contains: q,
            mode: 'insensitive',
          },
        },
      ];
    }
    filter.shop_id = +id;

    try {
      const { count, rows } = await this.productsService.getProductWithShop({
        page: +_page,
        limit: +_limit,
        sort: _sort,
        order: _order,
        filter,
        id: +id,
      });

      return res.status(HttpStatus.OK).json({
        message: 'Lấy danh sách sản phẩm của shop thành công',
        error: false,
        success: true,
        data: rows,
        count,
        current_page: +_page,
      });
    } catch (error) {
      return res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        message: error.message || 'Đã xảy ra lỗi vui lòng thử lại sau',
        error: true,
        success: false,
      });
    }
  }
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateProductDto,
    @Res() res,
  ) {
    try {
      const productEdit = await this.productsService.update(+id, body);
      if (!productEdit) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: 'Đã xảy ra lỗi không cập nhật sản phẩm thành công',
          error: true,
          success: false,
        });
      }
      return res.status(HttpStatus.ACCEPTED).json({
        message: 'Cập nhật sản phẩm thành công',
        error: false,
        success: true,
        data: productEdit,
      });
    } catch (error) {
      return res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        message: error.message || 'Đã xảy ra lỗi vui lòng thử lại sau',
        error: true,
        success: false,
      });
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Res() res) {
    try {
      const productDelete = await this.productsService.remove(+id);
      if (!productDelete) {
        return res.status(HttpStatus.BAD_GATEWAY).json({
          message: 'Đã xảy ra lỗi không thể xóa sản phẩm',
          error: true,
          success: false,
        });
      }
      return res.status(HttpStatus.ACCEPTED).json({
        message: `Đã xóa sản phẩm id ${id} thành công`,
        error: false,
        success: true,
        data: productDelete,
      });
    } catch (error) {
      return res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        message: error.message || 'Đã xảy ra lỗi vui lòng thử lại sau',
        error: true,
        success: false,
      });
    }
  }
}
