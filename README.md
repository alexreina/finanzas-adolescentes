# Finanzas adolescentes – curso interactivo

Una plataforma educativa web diseñada para enseñar **educación financiera a adolescentes** mediante módulos interactivos, gamificación y ejemplos prácticos.
Cada módulo combina **teoría, quizzes, retos prácticos y un sistema de insignias**, motivando a los usuarios a aprender sobre dinero de forma divertida y estructurada.

---

## ✨ Características principales

* **Curso dividido en módulos temáticos**:

  1. **¿Por qué hablar de dinero?**
  2. **El dinero que entra** – ingresos, paga, primeros trabajos.
  3. **El dinero que se va** – gastos, presupuesto y control financiero.
  4. **Ahorro e inversión** – interés compuesto y primeros pasos en inversión.
  5. **Compras seguras y seguridad digital** – proteger tu dinero en línea.
  6. **Deudas** – entender créditos, préstamos y sus riesgos.

* **Gamificación**:

  * Sistema de puntos por completar actividades.
  * Desbloqueo de **insignias** al superar retos y quizzes.
  * Progreso guardado automáticamente en `localStorage`.

* **Interactividad**:

  * Quizzes con feedback instantáneo y animaciones.
  * Retos prácticos que desbloquean contenido adicional.
  * Uso de confeti 🎉 y microinteracciones para celebrar logros.

* **100% cliente (no backend)**:

  * El estado se guarda en el navegador, sin necesidad de servidor.
  * Perfecto para uso offline o integración sencilla en otras plataformas.

---

## 🗂 Estructura del proyecto

```
.
├── css/
│   └── styles.css          # Estilos personalizados y reutilizables
│
├── js/
│   ├── page-helpers.js     # Funciones utilitarias genéricas
│   ├── progress.js         # Sistema de progreso, puntos e insignias
│   ├── quiz.js             # Lógica de los quizzes
│   └── reto.js             # Lógica para los retos prácticos
│
├── index.html               # Página principal con resumen de progreso
├── el-dinero-que-entra.html # Módulo 2
├── el-dinero-que-se-va.html # Módulo 3 (gastos y presupuesto)
├── ahorrar-con-objetivos-la-magia-del-interes-compuesto-y-empezar-a-invertir.html # Módulo 4
├── publicidad-redes-sociales-y-seguridad-digital-para-proteger-tu-dinero.html     # Módulo 5
├── prestamos-y-creditos-entiende-por-que-el-dinero-prestado-nunca-sale-gratis.html # Módulo 6
│
└── README.md                # Documentación del proyecto
```

---

## 🚀 Cómo ejecutar el proyecto

Este proyecto no requiere instalación ni backend. Solo necesitas un navegador web.

### Opción 1: Abrir directamente

1. Descarga o clona el repositorio:

   ```bash
   git clone https://github.com/<tu-usuario>/<nombre-repo>.git
   cd <nombre-repo>
   ```
2. Abre `index.html` en tu navegador.

---

### Opción 2: Servidor local (opcional pero recomendado)

Para evitar problemas con rutas relativas y `localStorage`, puedes servir el proyecto con un servidor local:

* **Python 3:**

  ```bash
  python3 -m http.server
  ```

  Luego abre en el navegador:
  [http://localhost:8000](http://localhost:8000)

* **Node.js (con `http-server`):**

  ```bash
  npm install -g http-server
  http-server
  ```

---

## 🏆 Sistema de insignias

Cada acción importante desbloquea una insignia. El objetivo final es **coleccionarlas todas**.

| Badge ID               | Emoji | Descripción                                              |
| ---------------------- | ----- | -------------------------------------------------------- |
| `detective_gastos`     | 🔍    | Identifica en qué se te va el dinero por primera vez.    |
| `ant_killer`           | 🐜    | Controla tus pequeños gastos diarios durante una semana. |
| `debit_defender`       | 💳    | Aprende a usar la tarjeta de débito correctamente.       |
| `ahorro_aventurero`    | 🐷    | Completa tu primer objetivo de ahorro.                   |
| `inversion_explorador` | 📈    | Descubre cómo funciona la magia del interés compuesto.   |
| `seguridad_guardian`   | 🛡️   | Realiza compras seguras y protege tu dinero online.      |
| `deuda_domador`        | 🪤    | Comprende por qué el dinero prestado nunca es gratis.    |
| `curso_completado`     | 🏆    | Completa todos los módulos del curso.                    |

---

## 🧑‍💻 Flujo de desarrollo

### 1. Actualizar desde el repositorio remoto

Antes de empezar a trabajar, asegúrate de tener la última versión:

```bash
git pull origin main
```

### 2. Guardar cambios locales

```bash
git add .
git commit -m "Descripción breve de los cambios realizados"
git push origin main
```

### 3. Crear una rama para nuevas características

```bash
git checkout -b feature/nueva-funcionalidad
```

---

## 🛠 Tecnologías utilizadas

* **HTML5 + CSS3 + TailwindCSS** – estructura y diseño moderno y responsive.
* **JavaScript puro (Vanilla JS)** – interactividad y lógica de negocio.
* **localStorage** – persistencia de datos sin backend.
* **AOS (Animate On Scroll)** – animaciones de entrada.
* **Canvas Confetti** – celebraciones visuales al desbloquear logros.

---

## 🔒 Estado y progreso

El progreso de cada usuario se guarda automáticamente en `localStorage`.
Esto incluye:

* Puntos acumulados.
* Insignias desbloqueadas.
* Módulos completados.

Esto significa que **cada usuario tiene su propio progreso** en su navegador, pero si borran caché, también se borrarán los datos.

---

## 🌱 Próximos pasos

* [ ] Añadir un sistema de **rankings globales** con backend opcional.
* [ ] Mejorar la accesibilidad (etiquetas ARIA, contraste, teclado).
* [ ] Agregar más quizzes y retos a cada módulo.
* [ ] Implementar exportación/importación de progreso en JSON.
* [ ] Traducciones automáticas a otros idiomas.

---

## 👥 Contribuir

1. Haz un fork de este repositorio.
2. Crea una nueva rama:

   ```bash
   git checkout -b feature/nueva-funcionalidad
   ```
3. Realiza tus cambios y haz commit:

   ```bash
   git commit -m "Descripción de los cambios"
   ```
4. Sube tu rama:

   ```bash
   git push origin feature/nueva-funcionalidad
   ```
5. Abre un Pull Request y descríbenos qué has hecho.

---

## 📜 Licencia

Este proyecto está bajo la licencia MIT.
Eres libre de usarlo, modificarlo y distribuirlo, siempre que se incluya el aviso de copyright y la licencia original.

---

## 🌟 Inspiración

El proyecto nace con la misión de que los adolescentes **aprendan a manejar su dinero**, evitando errores comunes y fomentando la **independencia financiera** desde una edad temprana.
Se inspira en ejemplos reales y busca ser **divertido, interactivo y visualmente atractivo**.
