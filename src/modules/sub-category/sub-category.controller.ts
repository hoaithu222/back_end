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
  Req,
  Query,
} from '@nestjs/common';
import { SubCategoryService } from './sub-category.service';
import { CreateSubCategoryDto } from './dto/create-sub-category.dto';
import { UpdateSubCategoryDto } from './dto/update-sub-category.dto';
import { error } from 'console';

@Controller('sub-category')
export class SubCategoryController {
  constructor(private readonly subCategoryService: SubCategoryService) {}

  @Post()
  async create(@Body() body: CreateSubCategoryDto, @Res() res, @Req() req) {
    const user = req.user;

    if (!(user.role === 'Admin' && user.is_admin)) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'Bạn không có quyền tạo danh mục con',
        error: true,
        success: false,
      });
    }
    if (!body.name) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Vui lòng nhập tên danh mục con',
        error: true,
        success: false,
      });
    }
    if (!body.category_id) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Vui lòng nhập danh mục chinh',
        error: true,
        success: false,
      });
    }

    try {
      const newSubCategory = await this.subCategoryService.create(body);
      return res.status(HttpStatus.CREATED).json({
        message: 'Thêm danh mục thành công',
        error: false,
        success: true,
        data: newSubCategory,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: error.message || 'Lỗi khi thêm danh mục con',
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

    const { count, rows } = await this.subCategoryService.findAll({
      page: +_page,
      limit: +_limit,
      sort: _sort,
      order: _order,
      filter,
    });
    return res.status(HttpStatus.ACCEPTED).json({
      message: 'Lấy danh sách thành công',
      count: count,
      data: rows,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Res() res) {
    const sub_category = await this.subCategoryService.findOne(+id);
    if (!sub_category) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: `Lỗi khi lấy danh mục ${id}`,
        success: false,
        error: true,
      });
    }
    return res.status(HttpStatus.ACCEPTED).json({
      message: 'Lấy danh mục thành công',
      success: true,
      error: false,
      data: sub_category,
    });
  }
  @Get('all/:id')
  async getSub_Category(@Param('id') id: string, @Res() res) {
    try {
      const data = await this.subCategoryService.findSubCategory(+id);
      return res.status(HttpStatus.OK).json({
        message: 'Lấy danh sách thành công',
        error: false,
        success: true,
        data: data,
      });
    } catch (error) {
      return res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        message: error.message || 'Đã có lỗi xảy ra ',
        error: true,
        success: false,
      });
    }
  }
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateSubCategoryDto,
    @Res() res,
    @Req() req,
  ) {
    const user = req.user;

    if (!(user.role === 'Admin' && user.is_admin)) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'Bạn không có quyền sửa danh mục con',
        error: true,
        success: false,
      });
    }
    const editCategory = await this.subCategoryService.update(+id, body);
    if (!editCategory) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Lỗi khi sửa danh mục',
        error: true,
        success: false,
      });
    }
    return res.status(HttpStatus.ACCEPTED).json({
      message: 'Sửa danh mục thành công',
      error: false,
      success: true,
      data: editCategory,
    });
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Res() res, @Req() req) {
    const user = req.user;

    if (!(user.role === 'Admin' && user.is_admin)) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'Bạn không có quyền sửa danh mục con',
        error: true,
        success: false,
      });
    }
    const deleteSubCategory = await this.subCategoryService.remove(+id);
    if (!deleteSubCategory) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Lỗi khi xóa danh mục',
        error: true,
        success: false,
      });
    }
    return res.status(HttpStatus.ACCEPTED).json({
      message: 'Xóa danh mục thành công',
      error: false,
      success: true,
      data: deleteSubCategory,
    });
  }
}
