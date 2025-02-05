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
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { error } from 'console';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  async create(@Body() body: CreateCategoryDto, @Res() res, @Req() req) {
    const user = req.user;

    if (!(user.role === 'Admin' && user.is_admin)) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'Bạn không có quyền tạo danh mục',
        error: true,
        success: false,
      });
    }
    if (!body.name) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Tên danh mục không được để trống',
        error: true,
        success: false,
      });
    }
    const newCategory = await this.categoryService.create(body);
    if (!newCategory) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Lỗi khi thêm danh mục',
        error: true,
        success: false,
      });
    }
    return res.status(HttpStatus.CREATED).json({
      message: 'Thêm danh mục thành công',
      error: false,
      success: true,
      data: newCategory,
    });
  }

  @Get()
  async findAll(@Query() query, @Res() res) {
    const {
      _page = 1,
      _limit = 10,
      _order = 'asc',
      _sort = 'id',
      filter_active,
      filter_name,
      name_like,
      q,
    } = query;
    const filter = {} as { [key: string]: string | boolean | {} };
    if (filter_name) {
      filter.name = filter_name;
    }
    if (filter_active) {
      filter.active = filter_active;
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
    const { count, rows } = await this.categoryService.findAll({
      page: +_page,
      limit: +_limit,
      sort: _sort,
      order: _order,
      filter,
    });
    return res.status(HttpStatus.ACCEPTED).json({
      message: 'Lấy danh sách danh mục thành công',
      success: true,
      error: false,
      data: rows,
      count: count,
    });
  }
  @Get('all')
  async getAll(@Res() res) {
    const allCategory = await this.categoryService.getAll();
    if (!allCategory) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Lỗi khi lấy danh mục',
        error: true,
        success: false,
      });
    }
    return res.status(HttpStatus.ACCEPTED).json({
      message: 'Lấy tất cả danh mục tành công',
      error: false,
      success: true,
      data: allCategory,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Res() res) {
    const category = await this.categoryService.findOne(+id);
    if (!category) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: ` Lấy danh mục ${id} thất bại `,
        success: false,
        error: true,
      });
    }
    return res.status(HttpStatus.ACCEPTED).json({
      message: ` Lấy danh mục ${id} thành công `,
      success: true,
      error: false,
      data: category,
    });
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateCategoryDto,
    @Res() res,
    @Req() req,
  ) {
    const user = req.user;
    if (!(user.role === 'Admin' && user.is_admin)) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'Bạn không có quyền sửa danh mục',
        error: true,
        success: false,
      });
    }
    try {
      const editCategory = await this.categoryService.update(+id, body);
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
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Lỗi khi sửa danh mục',
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
        message: 'Bạn không có quyền xóa danh mục',
        error: true,
        success: false,
      });
    }
    const deleteCategory = await this.categoryService.remove(+id);
    if (!deleteCategory) {
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
      data: deleteCategory,
    });
  }
}
