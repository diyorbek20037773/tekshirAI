#!/bin/bash
# Railway build script — frontend build + backend start

echo "=== Frontend build boshlandi ==="
cd frontend

# Node.js o'rnatilganmi tekshirish
if command -v node &> /dev/null; then
    echo "Node.js: $(node -v)"
    npm install
    npm run build
    echo "=== Frontend build tayyor! ==="
else
    echo "Node.js topilmadi, frontend build o'tkazib yuborildi"
fi

cd ..
