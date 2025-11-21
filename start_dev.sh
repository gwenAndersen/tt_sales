#!/bin/bash

export DATABASE_URL='postgresql://neondb_owner:npg_ROGu0KFkq3Lt@ep-autumn-forest-a1dipbxy-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

echo "Starting development servers with DATABASE_URL set..."
NODE_ENV=development tsx server/index.ts