import sqlite3

# Connect to your SQLite database
conn = sqlite3.connect('C:/Users/nishm/OneDrive/Documents/GitHub/Basic-Web-App-Template/database/database.db')  # Replace with your actual .db file path

# Get the schema for all tables
cursor = conn.cursor()
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()

# Print the schema for each table
for table in tables:
    table_name = table[0]
    print(f"Schema for table {table_name}:")
    cursor.execute(f"PRAGMA table_info({table_name});")
    columns = cursor.fetchall()
    for col in columns:
        print(col)

# Close the connection
conn.close()
