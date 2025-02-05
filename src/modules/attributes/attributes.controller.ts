import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  Req,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { AttributesService } from './attributes.service';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';
import { error } from 'console';

@Controller('attributes')
export class AttributesController {
  constructor(private readonly attributesService: AttributesService) {}

  @Post()
  async create(@Body() body: CreateAttributeDto, @Res() res, @Req() req) {
    const user = req.user;

    // Kiểm tra quyền
    if (!(user.role === 'Admin' && user.is_admin)) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'Bạn không có quyền tạo thuộc tính',
        error: true,
        success: false,
      });
    }

    // Validate dữ liệu
    if (!body.name) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Tên thuộc tính không được để trống',
        error: true,
        success: false,
      });
    }

    if (!body.value || body.value.length === 0) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Giá trị của thuộc tính không được để trống',
        error: true,
        success: false,
      });
    }

    try {
      const data = await this.attributesService.create(body);

      return res.status(HttpStatus.CREATED).json({
        message: 'Đã tạo thuộc tính thành công',
        success: true,
        error: false,
        data: data, // Trả về dữ liệu đã tạo
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: error.message || 'Đã xảy ra lỗi',
        success: false,
        error: true,
      });
    }
  }

  @Get()
  async findAll(@Query() query, @Res() res) {
    const {
      _page = 1,
      _limit = 3,
      _order = 'asc',
      _sort = 'id',
      filter_name,
      q,
      name_like,
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
            contains: q,
            mode: 'insensitive',
          },
        },
      ];
    }
    try {
      const { count, rows, pages, currentPage } =
        await this.attributesService.findAll({
          page: +_page,
          limit: +_limit,
          sort: _sort,
          order: _order,
          filter,
        });
      return res.status(HttpStatus.ACCEPTED).json({
        message: 'Lấy danh sách thành công',
        success: true,
        error: false,
        data: rows,
        pages: pages,
        currentPage: currentPage,
        count,
      });
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: e.message || 'Đã xảy ra lỗi vui lòng thử lại sau',
        error: true,
        success: false,
      });
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Res() res) {
    try {
      const data = await this.attributesService.findOne(+id);
      return res.status(HttpStatus.ACCEPTED).json({
        message: `Đã lấy ${id} thành công`,
        success: true,
        error: false,
        data: data,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: error.message || 'Đã xảy ra lỗi khi thêm sản phẩm',
        success: false,
        error: true,
      });
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateAttributeDto,
    @Res() res,
    @Req() req,
  ) {
    const user = req.user;

    if (!(user.role === 'Admin' && user.is_admin)) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'Bạn không có quyền tạo thuộc tính',
        error: true,
        success: false,
      });
    }
    try {
      const attribute = await this.attributesService.update(+id, body);
      return res.status(HttpStatus.ACCEPTED).json({
        message: 'Đã tạo sauwr thành công thuộc tính',
        success: true,
        error: false,
        data: attribute,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_GATEWAY).json({
        message: error.message || 'Đã xảy ra lỗi',
        success: false,
        error: true,
      });
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Res() res, @Req() req) {
    const user = req.user;

    if (!(user.role === 'Admin' && user.is_admin)) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'Bạn không có quyền tạo thuộc tính',
        error: true,
        success: false,
      });
    }
    try {
      const data = await this.attributesService.remove(+id);
      if (!data) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          error: true,
          message: 'Đã xảy ra lỗi khi xóa',
          success: false,
        });
      }
      return res.status(HttpStatus.ACCEPTED).json({
        error: false,
        success: true,
        message: 'Bạn đã xóa thuộc tính thành công',
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_GATEWAY).json({
        error: true,
        message: error.message || 'Đã xảy ra lỗi khi xóa',
        success: false,
      });
    }
  }
}
