// utils/pagination.go
package utils

import (
	"fmt"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type Pagination struct {
	Page       int `json:"page"`
	PageSize   int `json:"page_size"`
	TotalCount int `json:"total_count"`
	TotalPages int `json:"total_pages"`
}

// Paginate 是一个封装了分页逻辑的函数，用来处理查询数据并返回分页结果
func Paginate(c *gin.Context, db *gorm.DB, result interface{}) (*Pagination, error) {
	// 获取分页参数，默认当前页为1，每页10条数据
	page := c.DefaultQuery("page", "1")
	pageSize := c.DefaultQuery("page_size", "10")

	pageInt, err := strconv.Atoi(page)
	if err != nil {
		return nil, fmt.Errorf("invalid page number")
	}

	pageSizeInt, err := strconv.Atoi(pageSize)
	if err != nil {
		return nil, fmt.Errorf("invalid page size")
	}

	// 计算偏移量
	offset := (pageInt - 1) * pageSizeInt

	// 查询总记录数
	var totalCount int64
	if err := db.Model(result).Where("status = ?", "active").Count(&totalCount).Error; err != nil {
		return nil, err
	}

	// 查询分页数据
	if err := db.Where("status = ?", "active").Offset(offset).Limit(pageSizeInt).Find(result).Error; err != nil {
		return nil, err
	}

	// 计算总页数
	totalPages := (int(totalCount) + pageSizeInt - 1) / pageSizeInt

	// 返回分页信息
	return &Pagination{
		Page:       pageInt,
		PageSize:   pageSizeInt,
		TotalCount: int(totalCount),
		TotalPages: totalPages,
	}, nil
}
