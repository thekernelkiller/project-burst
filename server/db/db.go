package db

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

type Database struct {
	db *sql.DB
}

func NewDatabase() (*Database, error) {
	// Load the .env file
	err := godotenv.Load()
	if err != nil {
		log.Printf("Error loading .env file: %v", err)
	}

	supabaseConnectionString := os.Getenv("SUPABASE_CONNECTION_STRING")

	if supabaseConnectionString == "" {
		return nil, fmt.Errorf("SUPABASE_CONNECTION_STRING environment variable is not set")
	}

	// Open the connection
	db, err := sql.Open("postgres", supabaseConnectionString)
	if err != nil {
		return nil, fmt.Errorf("error opening database connection: %v", err)
	}

	// Set connection pool parameters
	db.SetMaxIdleConns(3)
	db.SetMaxOpenConns(5)
	db.SetConnMaxLifetime(1800)

	// Test the connection
	err = db.Ping()
	if err != nil {
		return nil, fmt.Errorf("could not ping database: %v", err)
	}

	log.Println("Successfully connected to the database")

	return &Database{db: db}, nil
}

func (d *Database) Close() {
	if d.db != nil {
		d.db.Close()
	}
}

func (d *Database) GetDB() *sql.DB {
	return d.db
}

// package db

// import (
// 	"database/sql"
// 	"fmt"
// 	"log"
// 	"os"

// 	"github.com/golang-migrate/migrate/v4"
// 	"github.com/golang-migrate/migrate/v4/database/postgres"
// 	_ "github.com/golang-migrate/migrate/v4/source/file"
// 	"github.com/joho/godotenv"
// 	_ "github.com/lib/pq"
// )

// type Database struct {
// 	db *sql.DB
// }

// func NewDatabase() (*Database, error) {
// 	err := godotenv.Load()
// 	if err != nil {
// 		log.Printf("Error loading .env file: %v", err)
// 	}

// 	dbURL := os.Getenv("SUPABASE_CONNECTION_STRING")
// 	if dbURL == "" {
// 		return nil, fmt.Errorf("SUPABASE_URL environment variable is not set")
// 	}

// 	db, err := sql.Open("postgres", dbURL)
// 	if err != nil {
// 		return nil, fmt.Errorf("error opening database connection: %v", err)
// 	}

// 	if err := db.Ping(); err != nil {
// 		return nil, fmt.Errorf("could not ping database: %v", err)
// 	}

// 	if err := runMigrations(db); err != nil {
// 		return nil, fmt.Errorf("error running migrations: %v", err)
// 	}

// 	log.Println("Successfully connected to the database and ran migrations")

// 	return &Database{db: db}, nil
// }

// func runMigrations(db *sql.DB) error {
// 	driver, err := postgres.WithInstance(db, &postgres.Config{})
// 	if err != nil {
// 		return fmt.Errorf("could not create migration driver: %v", err)
// 	}

// 	m, err := migrate.NewWithDatabaseInstance(
// 		"file://db/migrations",
// 		"postgres", driver)
// 	if err != nil {
// 		return fmt.Errorf("could not create migrate instance: %v", err)
// 	}

// 	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
// 		return fmt.Errorf("could not run migrations: %v", err)
// 	}

// 	return nil
// }

// func (d *Database) Close() {
// 	if d.db != nil {
// 		d.db.Close()
// 	}
// }

// func (d *Database) GetDB() *sql.DB {
// 	return d.db
// }
