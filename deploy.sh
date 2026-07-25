#!/bin/bash
# ==========================================
#  abook2read.xyz 博客平台一键部署脚本
#  在 Git Bash 终端执行: bash deploy.sh
# ==========================================

SERVER="root@47.242.226.212"
DOMAIN="abook2read.xyz"
REPO="https://github.com/lvjingzhi/blog-platform.git"

echo "=========================================="
echo "  部署静志博客到 ${DOMAIN}"
echo "=========================================="
echo ""

# ---- 先推最新代码到 GitHub ----
echo "[0/4] 推送最新代码到 GitHub..."
cd "$(dirname "$0")"
git add -A && git commit -m "deploy: 准备部署" || true
git push || true

# ---- 服务器上操作 ----
echo ""
echo "[1/4] 连接服务器并安装环境..."
echo "（此时需要输入服务器密码）"
echo ""

ssh -t ${SERVER} << 'ENDSSH'
set -e

# 安装 Node.js
if ! command -v node &> /dev/null; then
  echo "安装 Node.js 20..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt install -y nodejs
fi

# 安装 Git
if ! command -v git &> /dev/null; then
  apt update && apt install -y git
fi

# 安装 Nginx
if ! command -v nginx &> /dev/null; then
  apt update && apt install -y nginx
fi

# 安装 PM2
if ! command -v pm2 &> /dev/null; then
  npm install -g pm2
fi

echo "✅ 环境安装完成"
ENDSSH

# ---- 拉取代码 ----
echo ""
echo "[2/4] 拉取代码..."
ssh -t ${SERVER} << 'ENDSSH'
set -e

if [ -d /root/blog-platform ]; then
  cd /root/blog-platform
  git pull
else
  git clone https://github.com/lvjingzhi/blog-platform.git /root/blog-platform
fi

# 安装后端依赖
cd /root/blog-platform/server
npm install

# 安装前端依赖 + 构建
cd /root/blog-platform/client
npm install
npm run build

# 修复目录权限，确保 Nginx 可以读取
chmod 755 /root /root/blog-platform /root/blog-platform/client /root/blog-platform/client/dist
chmod -R 755 /root/blog-platform/client/dist

echo "✅ 代码拉取并构建完成"
ENDSSH

# ---- 配置 Nginx ----
echo ""
echo "[3/4] 配置 Nginx..."
ssh -t ${SERVER} << 'ENDSSH'
set -e

cat > /etc/nginx/sites-available/blog << 'EOF'
server {
    listen 80;
    server_name abook2read.xyz www.abook2read.xyz;

    root /root/blog-platform/client/dist;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri /index.html;
    }
}
EOF

ln -sf /etc/nginx/sites-available/blog /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

nginx -t && systemctl restart nginx && systemctl enable nginx

echo "✅ Nginx 配置完成"
ENDSSH

# ---- 启动后端 ----
echo ""
echo "[4/4] 启动后端..."
ssh -t ${SERVER} << 'ENDSSH'
set -e

# 创建 .env
cat > /root/blog-platform/server/.env << 'EOF'
PORT=3001
JWT_SECRET=abook2read-jwt-secret-2024
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
XORPAY_AID=706615
XORPAY_SECRET=2aad1cfde0fc4ef380d0ef2178387722
SMTP_HOST=smtp.163.com
SMTP_PORT=465
SMTP_USER=abook2read@163.com
SMTP_PASS=NQkGSimXwAudRJmi
SMTP_FROM=abook2read@163.com
EOF

mkdir -p /root/blog-platform/server/data

cd /root/blog-platform/server
pm2 delete blog-backend 2>/dev/null || true
pm2 start index.js --name blog-backend
pm2 save

echo "✅ 后端启动完成"
pm2 status
ENDSSH

echo ""
echo "=========================================="
echo "  ✅ 部署完成！"
echo ""
echo "  博客地址:  http://${DOMAIN}"
echo "  管理后台:  http://${DOMAIN}/admin/login"
echo "  账号: admin  密码: admin123"
echo "=========================================="