import { apiRequest } from "./api";

// 创建品牌
export const createSong = async (name: string, lyrics: string) => {
  const songData = {
    name,
    lyrics,
  };

  try {
    // 调用通用的 API 请求函数
    const response = await apiRequest<{ message: string, data: any }>(
      "/songs", // 创建品牌接口路径
      "POST",    // 请求方法
      songData  // 请求体（包含品牌名称、描述、Logo）
    );

    // 如果请求成功并返回数据
    if (response.code === 200) {
      return {
        success: true,
        message: response.message,
        data: response.data,
      };
    }

    // 请求失败时返回错误信息
    return {
      success: false,
      message: response.message,
    };
  } catch (error) {
    // 发生错误时返回
    return {
      success: false,
      message: error.message,
    };
  }
};


export const getSongs = async (search: string) => {
  try {
    // 调用通用的 API 请求函数
    const response = await apiRequest<{ message: string, data: any[] }>(
      `/songs?lyric=${search}`, 
      "GET",     // 请求方法
      null       // 请求体为空
    );

    // 如果请求成功且有数据
    if (response.code === 200) {
      return {
        success: true,
        data: response.data || [],
      };
    }

    // 请求失败时返回错误信息
    return {
      success: false,
      message: response.message,
    };
  } catch (error) {
    // 发生错误时返回
    return {
      success: false,
      message: error.message,
    };
  }
};


export const setLyric = async ({songId, progress, speed, isPlaying}:{songId: number, progress: number, speed: number, isPlaying: number}) => {
  const lyricData = {
    song_id: songId,
    progress: progress,
    speed: speed,
    is_playing: isPlaying,
  };

  console.log(lyricData);
  
  try {
    // 调用通用的 API 请求函数，使用 PUT 请求更新品牌信息
    const response = await apiRequest<{ message: string, data: any }>(
      `/lyric`, // 动态拼接 URL，传递品牌 ID
      "POST",           // 请求方法
      lyricData       // 请求体（包含品牌信息）
    );

    // 如果请求成功并返回数据
    if (response.code === 200) {
      return {
        success: true,
        message: response.message,
        data: response.data,
      };
    }

    // 请求失败时返回错误信息
    return {
      success: false,
      message: response.message,
    };
  } catch (error) {
    // 发生错误时返回
    return {
      success: false,
      message: error.message,
    };
  }
};


export const getLyric = async () => {
  try {
    // 调用通用的 API 请求函数，使用 DELETE 请求删除品牌
    const response = await apiRequest<{ message: string }>(
      "/lyric", // 动态拼接 URL，传递品牌 ID
      "GET",        // 使用 DELETE 请求
      null             // 无需请求体
    );

    // 如果请求成功并返回信息
    if (response.code === 200) {
      return {
        success: true,
        message: response.message,
        data: response.data,
      };
    }

    // 请求失败时返回错误信息
    return {
      success: false,
      message: response.message,
    };
  } catch (error) {
    // 发生错误时返回
    return {
      success: false,
      message: error.message,
    };
  }
};
