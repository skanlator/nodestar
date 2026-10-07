Handled errors (AppError): If any part of the code throws an AppError, the client receives the specified HTTP code (e.g., 400) and the exact message.

Unhandled errors (500): If an unexpected error occurs (e.g., a database failure or syntax error), the app catches the error, responds with a 500 Internal Server Error, and avoids leaking sensitive application details or traces.
