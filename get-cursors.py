import os
import json

def get_cursors(cursor_dir="cursors"):
  """Возвращает список имен файлов курсоров с расширением .png."""
  try:
    cursors = [f for f in os.listdir(cursor_dir) if not f.startswith('.')]
    if not cursors:
      return json.dumps({'error': 'No cursors found'})
    return json.dumps([f'{f}.png' for f in cursors])
  except FileNotFoundError:
    return json.dumps({'error': 'Cursor directory not found'})

if __name__ == '__main__':
  print(get_cursors())
