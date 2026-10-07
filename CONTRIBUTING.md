# Guía de Contribución a DocuSynth 🚀

¡Gracias por contribuir a **DocuSynth**! Para mantener la consistencia y calidad del código, por favor sigue estos estándares.

## 📌 Estándar de Commits (Conventional Commits)

Todos los mensajes de confirmación deben seguir el formato [Conventional Commits](https://www.conventionalcommits.org/):

```
<tipo>(<ámbito opcional>): <descripción concisa>
```

### Tipos permitidos:
- **`feat`**: Una nueva funcionalidad para el usuario.
- **`fix`**: Corrección de un error.
- **`chore`**: Tareas de mantenimiento, dependencias o herramientas.
- **`docs`**: Cambios exclusivamente en la documentación.
- **`refactor`**: Refactorización de código que no altera la funcionalidad.
- **`test`**: Incorporación o corrección de pruebas.

---

## 🏗️ Flujo de Trabajo

1. **Crea una rama para tu cambio**:
   ```bash
   git checkout -b feature/nombre-de-la-funcionalidad
   ```
2. **Desarrolla de forma modular**:
   - Mantén los componentes en `src/components/`.
   - Lógica de llamadas a IA en `src/services/`.
   - Hooks en `src/hooks/`.
   - Tipos e interfaces en `src/types/`.
3. **Verifica los tipos de TypeScript**:
   Antes de confirmar cualquier cambio, valida que no existan errores de compilación:
   ```bash
   npx tsc --noEmit
   ```
4. **Envía tus cambios**:
   ```bash
   git push origin feature/nombre-de-la-funcionalidad
   ```
