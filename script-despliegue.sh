#!/bin/bash

# Script de despliegue rápido para Ubuntu + Virtualmin
# Uso: ./script-despliegue.sh

echo "🚀 Script de Despliegue - Adornos CBK"
echo "======================================"
echo ""

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: No se encontró package.json${NC}"
    echo "Ejecuta este script desde el directorio raíz del proyecto"
    exit 1
fi

echo -e "${YELLOW}📦 Paso 1: Verificando que la aplicación compila...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error al compilar la aplicación${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Compilación exitosa${NC}"
echo ""

echo -e "${YELLOW}📦 Paso 2: Creando archivo comprimido...${NC}"
tar --exclude='node_modules' \
    --exclude='.next' \
    --exclude='.git' \
    --exclude='.DS_Store' \
    --exclude='*.log' \
    --exclude='crb-app.tar.gz' \
    -czf crb-app.tar.gz .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Archivo crb-app.tar.gz creado exitosamente${NC}"
    echo ""
    echo -e "${YELLOW}📤 Paso 3: Instrucciones para subir al servidor:${NC}"
    echo ""
    echo "1. Sube el archivo crb-app.tar.gz al servidor:"
    echo "   scp crb-app.tar.gz usuario@tu-servidor.com:/home/usuario/"
    echo ""
    echo "2. Conéctate al servidor por SSH:"
    echo "   ssh usuario@tu-servidor.com"
    echo ""
    echo "3. En el servidor, ejecuta:"
    echo "   cd /home/usuario/domains/tienda.tu-dominio.com"
    echo "   mv ~/crb-app.tar.gz ."
    echo "   cd public_html"
    echo "   tar -xzf ../crb-app.tar.gz"
    echo "   npm install --production"
    echo "   npm run build"
    echo ""
    echo "4. Crea el archivo .env.local con tus variables de entorno"
    echo ""
    echo "5. Inicia con PM2:"
    echo "   pm2 start ecosystem.config.js"
    echo "   pm2 save"
    echo ""
    echo -e "${GREEN}✅ Listo! Revisa DESPLIEGUE-COMPLETO.md para más detalles${NC}"
else
    echo -e "${RED}❌ Error al crear el archivo comprimido${NC}"
    exit 1
fi

