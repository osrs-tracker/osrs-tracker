export const IndexPage = (version: string) =>
    `<html lang="en">
            <head>
                <title>OSRS Tracker API v${version}</title>

                <link href="https://fonts.googleapis.com/css?family=Roboto:300,400,500" rel="stylesheet">
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, minimal-ui">
                <style>
                    * {
                        font-family: 'Roboto', sans-serif;
                    }

                    h1 {
                        font-weight: 300;
                    }

                    .pill {
                        background-color: #00dd00;
                        color: #fff;
                        padding: 0 10px;
                        border-radius: 10px;
                        margin-left: 5px;
                    }
                </style>
            </head>

            <body>
                <h1>OSRS Tracker API v${version}</h1>
                <hr>
                <p>Status:
                    <span class="pill">live</span>
                </p>
                <p>For more information, please contact <a href="mailto:info@toxsickproductions.com">info@toxsickproductions.com</a>.</p>
                <hr>
                <p>2018 &copy; ToxSick Productions</p>
            </body>

            </html>`;
