# How to run

1. Initialize docker:  ```docker-compose up -d```
2. ```dotnet build```
3. ```dotnet ef database update```
4. ```dotnet watch```

# How to create events

1. First, you must create one category by making a post request to ```/api/category``` with json body as    ```{"categoryName" : "Running"}```
2. Now you can create event

# In case of errors
1. Remove obj and bin folders and rebuild the project
2. Remove all migrations and create a new migration. Don't forget to remove all data by using ```docker-compose down -v```