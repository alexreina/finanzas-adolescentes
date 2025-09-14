# 💰 Finanzas Personales para Adolescentes

Un curso interactivo de educación financiera diseñado específicamente para adolescentes. Aprende a ganar, gastar y ahorrar dinero de forma inteligente sin aburrirte.

## 🎯 ¿Qué es esto?

Una plataforma web moderna que convierte la educación financiera en una experiencia gamificada y divertida. Los adolescentes pueden aprender conceptos financieros importantes a través de:

- **6 misiones interactivas** de 10-20 minutos cada una
- **Sistema de badges** para motivar el progreso
- **Ejemplos reales** y lenguaje que conecta con los jóvenes
- **Quizzes y retos prácticos** para reforzar el aprendizaje

## 🚀 Características

### ✨ Experiencia de Usuario
- **Diseño responsive** - Funciona perfectamente en móvil y desktop
- **PWA ready** - Instalable como app en dispositivos móviles
- **Navegación intuitiva** - Fácil de usar para adolescentes
- **Animaciones suaves** - Interfaz moderna y atractiva

### 🏆 Sistema de Gamificación
- **6 badges únicos** - Uno por cada misión completada
- **Progreso persistente** - Se guarda en localStorage
- **Animaciones de celebración** - Confetti y efectos visuales
- **Estados claros** - Completado, en progreso, pendiente

### 📚 Contenido Educativo
- **Misión 1**: ¿Por qué hablar de dinero? (💸 Dinero consciente)
- **Misión 2**: El que entra (👛 Cazador de ingresos)
- **Misión 3**: El que se va (💳 Defensor del débito) - **¡Completamente funcional!**
- **Misión 4**: ¿Cómo consigo que crezca? (🌱 Ahorro aventurero)
- **Misión 5**: Compras seguras (🛡️ Guardián de seguridad)
- **Misión 6**: Deudas (📉 Domador de deudas)

## 🛠️ Tecnologías

- **HTML5** - Estructura semántica
- **Tailwind CSS** - Estilos modernos y responsive
- **JavaScript Vanilla** - Funcionalidad interactiva
- **PWA** - Progressive Web App capabilities
- **localStorage** - Persistencia de datos del usuario

## 📁 Estructura del Proyecto

```
finanzas-adolescentes/
├── index.html                          # Página principal con todas las misiones
├── el-dinero-que-se-va.html           # Misión 3 (completamente funcional)
├── [otras misiones].html              # Misiones 1,2,4,5,6 (placeholders)
├── favicon.svg                        # Icono personalizado (euro banknote)
├── manifest.json                      # Configuración PWA
├── css/
│   └── styles.css                     # Estilos personalizados
└── js/
    ├── config.js                      # Configuración compartida de Tailwind
    ├── progress.js                    # Sistema de badges y progreso
    ├── quiz.js                        # Lógica de quizzes interactivos
    ├── reto.js                        # Sistema de retos prácticos
    └── page-helpers.js                # Utilidades de página
```

## 🎮 Cómo Funciona

### Sistema de Badges
Cada misión tiene un badge único que se desbloquea al completar las actividades:

```javascript
// Ejemplo de desbloqueo de badge
unlockBadge("mision_3"); // Desbloquea "Defensor del débito"
```

### Persistencia de Datos
El progreso se guarda automáticamente en localStorage:

```javascript
{
  "badges": ["mision_3"],
  "missionsCompleted": [3],
  "points": 150
}
```

### Estados de Badges
- **✅ Completado**: Badge dorado con checkmark verde
- **⚠️ En progreso**: Badge con borde amarillo y "!"
- **❓ Pendiente**: Badge gris con "?"

## 🚀 Instalación y Uso

### Opción 1: Servidor Local
```bash
# Clonar el repositorio
git clone [tu-repo-url]
cd finanzas-adolescentes

# Servir con Python (opción 1)
python -m http.server 8000

# Servir con Node.js (opción 2)
npx serve .

# Servir con PHP (opción 3)
php -S localhost:8000
```

### Opción 2: GitHub Pages
1. Sube el código a GitHub
2. Ve a Settings → Pages
3. Selecciona "Deploy from a branch"
4. Elige "main" branch
5. ¡Tu sitio estará disponible en `https://tu-usuario.github.io/finanzas-adolescentes`

### Opción 3: Netlify/Vercel
1. Conecta tu repositorio GitHub
2. Deploy automático en cada push
3. URL personalizada incluida

## 🎨 Personalización

### Colores del Tema
Edita `js/config.js` para cambiar los colores:

```javascript
window.tailwindConfig = {
  theme: {
    extend: {
      colors: {
        purple: {
          600: '#9333ea', // Color principal
          700: '#7c3aed', // Hover states
        },
        teal: {
          500: '#14b8a6', // Color secundario
        }
      }
    }
  }
};
```

### Agregar Nuevas Misiones
1. Crea un nuevo archivo HTML siguiendo la estructura existente
2. Agrega el badge en `js/progress.js`
3. Actualiza la navegación en todas las páginas

## 📱 PWA Features

- **Instalable**: Los usuarios pueden "instalar" la app en sus dispositivos
- **Offline**: Funciona sin conexión a internet
- **App-like**: Se comporta como una app nativa
- **Notificaciones**: Preparado para notificaciones push (futuro)

## 🔧 Desarrollo

### Agregar Contenido a una Misión
1. Edita el archivo HTML correspondiente
2. Agrega secciones usando las clases de Tailwind existentes
3. Incluye quizzes usando la estructura existente
4. Agrega retos prácticos con el sistema de badges

### Debugging
- Abre DevTools → Console para ver logs
- Revisa localStorage para verificar el progreso guardado
- Usa `refreshBadges()` en la consola para actualizar badges manualmente

## 📈 Métricas y Analytics

El proyecto está preparado para integrar:
- Google Analytics
- Eventos personalizados
- Métricas de completación de misiones
- Tiempo de permanencia por sección

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-mision`)
3. Commit tus cambios (`git commit -m 'feat: agregar nueva misión'`)
4. Push a la rama (`git push origin feature/nueva-mision`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🎯 Roadmap

- [ ] Completar contenido de misiones 1, 2, 4, 5, 6
- [ ] Agregar más tipos de quizzes
- [ ] Sistema de puntos y leaderboards
- [ ] Notificaciones push
- [ ] Modo offline completo
- [ ] Integración con redes sociales
- [ ] Certificados de completación

## 📞 Contacto

¿Tienes preguntas o sugerencias? ¡Nos encantaría escucharte!

---

**¡Convierte tu dinero en un superpoder! 💪💰**