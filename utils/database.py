import sqlite3

def show_recent_edits():
    conn = sqlite3.connect(
        "agent/memory/code_fix.db"
    )

    cursor = conn.cursor()

    cursor.execute("""
    SELECT file_path, error, timestamp FROM edits
    ORDER BY timestamp DESC
    LIMIT 10
    """)

    recent_edits = cursor.fetchall()

    conn.close()

    return recent_edits

def update_database(result):
    conn = sqlite3.connect(
        "agent/memory/code_fix.db"
    )

    cursor = conn.cursor()

    cursor.execute("""
    INSERT INTO edits (
        file_path,
        original_code,
        modified_code,
        diff_text,
        error
    )
    VALUES (?, ?, ?, ?, ?)
    """, (
        result["file_path"],
        result["original_code"],
        result["modified_code"],
        result["diff_text"],
        result["error"]
    ))

    conn.commit()
    conn.close()