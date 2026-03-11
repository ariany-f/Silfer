<!DOCTYPE html>
<html lang="en">

    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{{ config('app.name', 'POS') }}</title>
        <link rel="icon" type="image/png" href="{{ asset('images/infyom.png') }}">
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Poppins:300,400,500,600,700" />
    </head>

    <body class="font-['Poppins'] antialiased">
        <div id="root"></div>
        <script src="/js/app.js?t={{ time() }}"></script>
    </body>

</html>
