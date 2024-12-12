import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	eslint: {
		ignoreDuringBuilds: true, // 忽略 eslint 检查
	},
	typescript: {
		ignoreBuildErrors: true, // 忽略 TypeScript 检查
	},
	reactStrictMode: true,
	transpilePackages: [  "@ant-design", "antd", "rc-util", "rc-pagination", "rc-picker", "rc-tree", "rc-table" ],
};

export default nextConfig;
