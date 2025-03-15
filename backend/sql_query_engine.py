import sqlite3
import pandas as pd
import os
import re
from typing import Dict, List, Optional, Tuple, Any

class SQLQueryEngine:
    """
    Handles complex queries using SQL for tabular data
    Extracts tables from documents and provides SQL querying capabilities
    """
    
    def __init__(self, db_dir: str = 'data/databases'):
        """Initialize the SQL query engine with a directory for SQLite databases"""
        self.db_dir = db_dir
        os.makedirs(db_dir, exist_ok=True)
    
    def get_db_path(self, kb_id: str) -> str:
        """Get the SQLite database path for a knowledge base"""
        return os.path.join(self.db_dir, f"{kb_id}.db")
    
    def process_tabular_file(self, kb_id: str, file_path: str, file_id: str) -> Dict[str, Any]:
        """
        Process a tabular file (CSV, Excel) and store it in SQLite
        Returns metadata about the imported tables
        """
        db_path = self.get_db_path(kb_id)
        table_name = f"table_{file_id}"
        
        # Read the file based on extension
        file_ext = os.path.splitext(file_path)[1].lower()
        if file_ext == '.csv':
            df = pd.read_csv(file_path)
        elif file_ext in ['.xlsx', '.xls']:
            # Handle multiple sheets in Excel
            xls = pd.ExcelFile(file_path)
            tables_info = []
            
            for sheet_name in xls.sheet_names:
                sheet_df = pd.read_excel(file_path, sheet_name=sheet_name)
                sheet_table_name = f"{table_name}_{self._sanitize_name(sheet_name)}"
                
                # Store metadata and import to SQLite
                self._import_dataframe_to_sqlite(df=sheet_df, 
                                               db_path=db_path, 
                                               table_name=sheet_table_name)
                
                tables_info.append({
                    "table_name": sheet_table_name,
                    "sheet_name": sheet_name,
                    "column_count": len(sheet_df.columns),
                    "row_count": len(sheet_df),
                    "columns": sheet_df.columns.tolist()
                })
            
            return {
                "file_id": file_id,
                "tables": tables_info,
                "total_tables": len(tables_info)
            }
        else:
            raise ValueError(f"Unsupported file type for SQL import: {file_ext}")
        
        # For CSV files, import the single dataframe
        self._import_dataframe_to_sqlite(df=df, db_path=db_path, table_name=table_name)
        
        return {
            "file_id": file_id,
            "tables": [{
                "table_name": table_name,
                "column_count": len(df.columns),
                "row_count": len(df),
                "columns": df.columns.tolist()
            }],
            "total_tables": 1
        }
    
    def execute_query(self, kb_id: str, query: str) -> Tuple[List[Dict[str, Any]], List[str]]:
        """
        Execute a SQL query against the knowledge base
        Returns results and column names
        """
        db_path = self.get_db_path(kb_id)
        
        if not os.path.exists(db_path):
            raise ValueError(f"No database found for knowledge base {kb_id}")
        
        conn = sqlite3.connect(db_path)
        
        try:
            # Execute the query
            cursor = conn.cursor()
            cursor.execute(query)
            
            # Get column names
            column_names = [description[0] for description in cursor.description]
            
            # Get all rows
            rows = cursor.fetchall()
            
            # Convert to list of dictionaries
            results = []
            for row in rows:
                result = {}
                for i, column in enumerate(column_names):
                    result[column] = row[i]
                results.append(result)
            
            return results, column_names
        
        except Exception as e:
            raise Exception(f"Error executing SQL query: {e}")
        
        finally:
            conn.close()
    
    def get_table_metadata(self, kb_id: str) -> List[Dict[str, Any]]:
        """
        Get metadata about all tables in the knowledge base
        Useful for constructing SQL queries
        """
        db_path = self.get_db_path(kb_id)
        
        if not os.path.exists(db_path):
            return []
        
        conn = sqlite3.connect(db_path)
        tables = []
        
        try:
            # Get all tables
            cursor = conn.cursor()
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
            table_names = [row[0] for row in cursor.fetchall()]
            
            # Get schema for each table
            for table_name in table_names:
                cursor.execute(f"PRAGMA table_info({table_name});")
                columns = cursor.fetchall()
                
                # Get row count
                cursor.execute(f"SELECT COUNT(*) FROM {table_name};")
                row_count = cursor.fetchone()[0]
                
                tables.append({
                    "table_name": table_name,
                    "columns": [{"name": col[1], "type": col[2]} for col in columns],
                    "row_count": row_count
                })
            
            return tables
        
        except Exception as e:
            raise Exception(f"Error getting table metadata: {e}")
        
        finally:
            conn.close()
    
    def _import_dataframe_to_sqlite(self, df: pd.DataFrame, db_path: str, table_name: str) -> None:
        """Import a pandas DataFrame to SQLite"""
        conn = sqlite3.connect(db_path)
        
        try:
            # Clean column names (remove special characters, spaces)
            df.columns = [self._sanitize_name(col) for col in df.columns]
            
            # Write to SQLite
            df.to_sql(table_name, conn, if_exists='replace', index=False)
        
        finally:
            conn.close()
    
    def _sanitize_name(self, name: str) -> str:
        """Sanitize table and column names for SQLite"""
        # Replace spaces and special chars with underscore
        sanitized = re.sub(r'[^\w]', '_', str(name))
        
        # Ensure it starts with a letter or underscore
        if sanitized and not sanitized[0].isalpha() and sanitized[0] != '_':
            sanitized = f"col_{sanitized}"
            
        return sanitized 