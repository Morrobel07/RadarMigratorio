# Instrucciones para publicar en GitHub Pages

1. Asegúrate de tener un repositorio en GitHub y sube todos los archivos de tu proyecto.
2. En tu repositorio, ve a Settings > Pages.
3. Selecciona la rama `main` y la carpeta raíz (`/`) o `/docs` si prefieres.
4. Si usas la raíz, asegúrate de que tu `_config.yml` esté en la raíz del repositorio.
5. GitHub Pages detectará automáticamente Jekyll y generará el sitio.
6. Si necesitas instalar dependencias localmente, ejecuta:

```sh
bundle install
```

7. Para probar localmente:

```sh
bundle exec jekyll serve
```

8. Accede a tu sitio en la URL que GitHub Pages te proporciona.

Más información: https://docs.github.com/en/pages/setting-up-a-github-pages-site-with-jekyll
