#!/bin/bash
# Railway build script — frontend + admin panel build

echo "=== Frontend build boshlandi ==="
cd frontend

if command -v node &> /dev/null; then
    echo "Node.js: $(node -v)"
    npm install
    npm run build
    echo "=== Frontend build tayyor! ==="
else
    echo "Node.js topilmadi, frontend build o'tkazib yuborildi"
fi

cd ..

echo "=== Admin panel build boshlandi ==="
cd admin_panel

if command -v node &> /dev/null; then
    npm install
    npm run build
    echo "=== Admin panel build tayyor! ==="
else
    echo "Node.js topilmadi, admin panel build o'tkazib yuborildi"
fi

cd ..
