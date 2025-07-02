### Backend
1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Create a `.env` file and add the following:
   ```env
    DBHOST = localhost
    DBUSER = root
    DBPASSWORD=
    DATABASE=books
    NODE_PORT=5000
    API_PREFIX=/api/v1/
    JWT_SECRET=your_jwt_secret
    JWT_EXPIRES_IN=7d
    ACCESS_LOGGING=false
    ERROR_LOGGING=false
   ```

4. Setup the Database use Stricture from ***structure.sql***

5. Setup your Frebase SDK file ***taskmanagement-iceweb-firebase-adminsdk-fbsvc-d1d1672345.json***

6. Start the server using `npm start`.

## API Endpoints
- **Login**: `POST /api/v1/users/login`
- All the other Endpoints are Listed in Postman JSON file import it in your postman to use it ***Task Management.postman_collection.json***

