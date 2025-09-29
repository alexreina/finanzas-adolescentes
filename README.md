# 💰 Finanzas Personales para Adolescentes

Una experiencia web para que adolescentes aprendan a dominar su dinero a través de misiones cortas, lenguaje cercano y dinámicas tipo videojuego.

## 🎯 Qué ofrece
- **6 misiones guiadas** (10‑20 min) que cubren desde los primeros euros hasta cómo esquivar deudas.
- **Pins coleccionables** que celebran cada misión completada y muestran el progreso en toda la aventura.
- **Historias reales** de celebridades y jóvenes que sirven como referencia para cada lección.
- **Quizzes interactivos** y **retos prácticos** que desbloquean el siguiente paso y mantienen la motivación alta.

## 🚀 Experiencia
- **Interfaz responsive** optimizada para móvil y desktop.
- **Animaciones y celebraciones** con confetti y mensajes personalizados al completar misiones.
- **Secciones plegables y navegación clara** para ir directo al tema que te interesa.
- **Modo app (PWA)** para fijar el curso en la pantalla de inicio y consultarlo incluso sin conexión estable.

## 🧭 Recorrido de misiones
1. **Domina tu dinero desde el primer euro (💸)**: por qué la educación financiera es tu superpoder diario.
2. **Haz que entre más dinero sin magia ni suerte (👛)**: habilidades y mini‑trabajos reales que suman ingresos.
3. **Tu dinero se esfuma… y ni te das cuenta (💳)**: presupuesto, clasificación de gastos y control total.
4. **Haz que tu dinero crezca mientras haces otra cosa (🌱)**: interés compuesto y primeros pasos para invertir.
5. **Aprende a comprar sin que te vendan la moto (🛡️)**: publicidad, timos e influencers sin filtro.
6. **Lo barato sale caro cuando pagas con deuda (📉)**: cómo evitar trampas de crédito y proteger tu libertad.

## 🏗️ Cómo está construido
- **HTML + Tailwind CSS + JavaScript** para una base ligera y fácil de extender.
- **Compilador estático** (`scripts/build.js`) que transforma los datos de cada misión en las páginas listas para publicar.
- **Datos estructurados** en `data/missions/` para mantener contenido, quizzes y retos en un solo lugar.
- **Service worker y assets vendorizados** (`sw.js`, `js/vendor/`) para soporte offline y efectos visuales consistentes.

## 📂 Estructura rápida
```
finanzas-adolescentes/
├── index.html                 # Landing principal
├── data/missions/             # Contenido de cada misión
├── docs/                      # Salida estática para publicar
├── js/                        # Lógica de navegación, progreso, quizzes y retos
├── css/                       # Tailwind compilado + estilos propios
└── scripts/build.js           # Generador estático que orquesta todo
```

## 🌟 Próximos pasos posibles
- Añadir nuevas misiones creando un JSON en `data/missions/` y ejecutando el build.
- Personalizar colores o tipografías modificando `tailwind.config.js`.
- Extender el sistema de pins con recompensas especiales para colecciones completas.

Finanzas nunca se había sentido tan jugable.
