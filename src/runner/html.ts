const getHtml = (entry: string) => `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>WASM Bootstrapper</title>
      <style>
        .error {
          display: none;
          font-size: 2rem;
          background: red;
          color: white;
        }

        .error--active {
          display: block;
        }
      </style>
    </head>
    <body>
      <main>
        <div class="error"></div>
      </main>

      <script>
        'use strict';

        fetch('/${entry}')
          .then(res => res.arrayBuffer())
          .then(buffer => WebAssembly.instantiate(buffer))
          .then(res => console.log(res))
          .catch(showError);
      </script>
    </body>
  </html>
`;

export default getHtml;
