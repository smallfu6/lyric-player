package utils

import (
	"fmt"
	"strconv"

	"golang.org/x/crypto/bcrypt"
)

func HashPassword(password string) (string, error) {
	// 生成一个加密后的密码哈希
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hashedPassword), nil
}

func VerifyPassword(hashedPassword, password string) error {
	// 验证密码是否与哈希匹配
	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
	return err
}

// StringToUint 将字符串类型的 ID 转换为 uint
func StringToUint(idStr string) (uint, error) {
	// 将字符串转换为 uint 类型
	id, err := strconv.ParseUint(idStr, 10, 0) // 基数 10, 0 表示使用默认的位数
	if err != nil {
		return 0, fmt.Errorf("转换失败: %v", err)
	}
	return uint(id), nil
}

// 假设这是 method1 编号生成方式：从 startCode 开始，按照数量生成编号
func GenerateNumbersMethod1(startCode uint, quantity int) []uint {
	numbers := []uint{}
	for i := 0; i < quantity; i++ {
		// 使用 startCode 作为基础编号，并增加序列号
		number := startCode + uint(i)
		numbers = append(numbers, number)
	}
	return numbers
}

// 假设这是 method2 编号生成方式：从 startRange 到 endRange 生成编号
func GenerateNumbersMethod2(startRange uint, endRange uint) []uint {
	numbers := []uint{}
	for i := startRange; i <= endRange; i++ {
		numbers = append(numbers, i)
	}
	return numbers
}
