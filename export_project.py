import os
import sys
import hashlib
from pathlib import Path
from datetime import datetime
from collections import defaultdict
from typing import List, Dict, Optional
import argparse


class AdvancedProjectExporter:
    
    CODE_EXTENSIONS = {
        '.py', '.js', '.jsx', '.ts', '.tsx', '.html', '.css', '.scss', '.sass',
        '.less', '.json', '.xml', '.yaml', '.yml', '.md', '.txt', '.env',
        '.gitignore', '.editorconfig', '.sh', '.bash', '.zsh', '.fish',
        '.ps1', '.bat', '.cmd', '.php', '.rb', '.go', '.rs', '.java',
        '.kt', '.swift', '.c', '.cpp', '.h', '.hpp', '.cs', '.fs', '.vb',
        '.sql', '.graphql', '.gql', '.proto', '.toml', '.ini', '.cfg',
        '.conf', '.lock', '.svg', '.vue', '.svelte', '.glsl', '.vert',
        '.frag', '.comp', '.rpc',
    }
    
    EXCLUDE_DIRS = {
        'node_modules', 'venv', '.venv', 'env', '.env', 'virtualenv',
        '__pycache__', '.git', '.svn', '.hg', '.idea', '.vscode',
        'dist', 'build', 'target', 'out', '.next', '.nuxt',
        'coverage', '.pytest_cache', '.mypy_cache', '.tox',
        'egg-info', '.eggs', 'pip-wheel-metadata',
        'vendor', 'bower_components', '.parcel-cache',
        '.turbo', '.serverless', 'cdk.out',
    }
    
    EXCLUDE_FILES = {
        '.DS_Store', 'Thumbs.db', 'desktop.ini',
        'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml',
        'Cargo.lock', 'Gemfile.lock', 'poetry.lock',
        '.eslintcache', '.prettiercache',
    }
    
    def __init__(self, project_root: str = '.', output_file: str = None):
        self.project_root = Path(project_root).resolve()
        self.output_file = Path(output_file) if output_file else self._generate_output_name()
        self.file_count = 0
        self.total_size = 0
        self.stats = defaultdict(int)
        self.file_hashes = {}
        
    def _generate_output_name(self) -> Path:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        project_name = self.project_root.name.replace(' ', '_').lower()
        return Path(f"{project_name}_export_{timestamp}.txt")
    
    def should_include_file(self, file_path: Path) -> bool:
        if not file_path.is_file():
            return False
        
        if file_path.name in self.EXCLUDE_FILES:
            return False
        
        for parent in file_path.parents:
            if parent.name in self.EXCLUDE_DIRS:
                return False
        
        if file_path.name in {'.gitignore', '.env', '.env.example', '.editorconfig'}:
            return True
        
        if file_path.suffix.lower() in self.CODE_EXTENSIONS:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    f.read(1024)  # Try reading first 1024 bytes
                return True
            except (UnicodeDecodeError, IOError):
                return False
        
        return False
    
    def generate_tree(self, directory: Path = None, prefix: str = '', 
                     max_depth: int = 10, current_depth: int = 0) -> List[str]:
        if directory is None:
            directory = self.project_root
        
        if current_depth >= max_depth:
            return [f"{prefix}└── ... (max depth reached)"]
        
        tree_lines = []
        entries = []
        
        try:
            for entry in sorted(directory.iterdir()):
                if entry.name in self.EXCLUDE_DIRS:
                    continue
                if entry.is_file() and not self.should_include_file(entry):
                    continue
                if entry.is_dir() and entry.name.startswith('.'):
                    continue
                entries.append(entry)
        except PermissionError:
            return tree_lines
        
        for i, entry in enumerate(entries):
            is_last_entry = (i == len(entries) - 1)
            connector = '└── ' if is_last_entry else '├── '
            new_prefix = prefix + ('    ' if is_last_entry else '│   ')
            
            if entry.is_dir():
                tree_lines.append(f"{prefix}{connector}{entry.name}/")
                tree_lines.extend(
                    self.generate_tree(entry, new_prefix, max_depth, current_depth + 1)
                )
            else:
                size = entry.stat().st_size
                size_str = self._format_size(size)
                tree_lines.append(f"{prefix}{connector}{entry.name} ({size_str})")
        
        return tree_lines
    
    def _format_size(self, size: int) -> str:
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024.0:
                return f"{size:.1f} {unit}"
            size /= 1024.0
        return f"{size:.1f} TB"
    
    def _calculate_hash(self, content: str) -> str:
        return hashlib.sha256(content.encode('utf-8')).hexdigest()[:8]
    
    def _count_lines_of_code(self, content: str, language: str) -> Dict[str, int]:
        lines = content.split('\n')
        total_lines = len(lines)
        blank_lines = len([l for l in lines if not l.strip()])
        
        # Simple comment detection
        comment_patterns = {
            'python': '#',
            'javascript': '//',
            'typescript': '//',
            'css': '/*',
            'html': '<!--',
            'bash': '#',
            'sql': '--',
            'yaml': '#',
        }
        
        comment_prefix = comment_patterns.get(language, '#')
        comment_lines = len([l for l in lines if l.strip().startswith(comment_prefix)])
        
        code_lines = total_lines - blank_lines - comment_lines
        
        return {
            'total': total_lines,
            'code': code_lines,
            'blank': blank_lines,
            'comment': comment_lines
        }
    
    def read_file_content(self, file_path: Path) -> Optional[str]:
        encodings = ['utf-8', 'latin-1', 'cp1252', 'iso-8859-1', 'ascii']
        
        for encoding in encodings:
            try:
                with open(file_path, 'r', encoding=encoding) as f:
                    content = f.read()
                # Store hash for duplicate detection
                file_hash = self._calculate_hash(content)
                self.file_hashes[str(file_path.relative_to(self.project_root))] = file_hash
                return content
            except UnicodeDecodeError:
                continue
            except Exception:
                return None
        
        return None
    
    def get_file_language(self, file_path: Path) -> str:
        extension_map = {
            '.py': 'python',
            '.js': 'javascript',
            '.jsx': 'jsx',
            '.ts': 'typescript',
            '.tsx': 'tsx',
            '.html': 'html',
            '.css': 'css',
            '.scss': 'scss',
            '.sass': 'sass',
            '.less': 'less',
            '.json': 'json',
            '.xml': 'xml',
            '.yaml': 'yaml',
            '.yml': 'yaml',
            '.md': 'markdown',
            '.sh': 'bash',
            '.bash': 'bash',
            '.zsh': 'bash',
            '.ps1': 'powershell',
            '.bat': 'batch',
            '.sql': 'sql',
            '.graphql': 'graphql',
            '.gql': 'graphql',
            '.java': 'java',
            '.kt': 'kotlin',
            '.swift': 'swift',
            '.rs': 'rust',
            '.go': 'go',
            '.php': 'php',
            '.rb': 'ruby',
            '.c': 'c',
            '.cpp': 'cpp',
            '.h': 'c',
            '.hpp': 'cpp',
            '.cs': 'csharp',
            '.toml': 'toml',
            '.ini': 'ini',
            '.cfg': 'ini',
            '.conf': 'ini',
            '.env': 'plaintext',
            '.gitignore': 'plaintext',
            '.glsl': 'glsl',
            '.vert': 'glsl',
            '.frag': 'glsl',
        }
        
        ext = file_path.suffix.lower()
        if ext in extension_map:
            return extension_map[ext]
        
        filename = file_path.name.lower()
        if filename == 'dockerfile':
            return 'dockerfile'
        elif filename == 'makefile':
            return 'makefile'
        
        return 'plaintext'
    
    def _find_duplicates(self) -> Dict[str, List[str]]:
        hash_map = defaultdict(list)
        for filepath, file_hash in self.file_hashes.items():
            hash_map[file_hash].append(filepath)
        
        return {h: files for h, files in hash_map.items() if len(files) > 1}
    
    def export(self, include_structure_only: bool = False, 
               include_stats: bool = True) -> bool:
        print(f"📂 Scanning project: {self.project_root}")
        
        try:
            with open(self.output_file, 'w', encoding='utf-8') as outfile:
                # Write header
                outfile.write("=" * 80 + "\n")
                outfile.write("ADVANCED PROJECT CODE EXPORT\n")
                outfile.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
                outfile.write(f"Project: {self.project_root.name}\n")
                outfile.write(f"Path: {self.project_root}\n")
                outfile.write("=" * 80 + "\n\n")
                
                # Write table of contents
                outfile.write("TABLE OF CONTENTS\n")
                outfile.write("=" * 80 + "\n")
                outfile.write("1. Project Structure\n")
                outfile.write("2. File Contents\n")
                if include_stats:
                    outfile.write("3. Statistics & Analysis\n")
                outfile.write("\n")
                
                # Section 1: Project Structure
                outfile.write("1. PROJECT STRUCTURE\n")
                outfile.write("=" * 80 + "\n\n")
                outfile.write(f"{self.project_root.name}/\n")
                
                tree_lines = self.generate_tree()
                for line in tree_lines:
                    outfile.write(line + "\n")
                
                outfile.write("\n" + "=" * 80 + "\n\n")
                
                if include_structure_only:
                    print(f"✅ Structure exported to: {self.output_file}")
                    return True
                
                # Section 2: File Contents
                outfile.write("2. FILE CONTENTS\n")
                outfile.write("=" * 80 + "\n\n")
                
                files_to_export = []
                for root, dirs, files in os.walk(self.project_root):
                    dirs[:] = [d for d in dirs if d not in self.EXCLUDE_DIRS]
                    root_path = Path(root)
                    for file in files:
                        file_path = root_path / file
                        if self.should_include_file(file_path):
                            files_to_export.append(file_path)
                
                files_to_export.sort()
                total_files = len(files_to_export)
                
                for i, file_path in enumerate(files_to_export, 1):
                    try:
                        relative_path = file_path.relative_to(self.project_root)
                    except ValueError:
                        relative_path = file_path
                    
                    content = self.read_file_content(file_path)
                    if content is None:
                        continue
                    
                    language = self.get_file_language(file_path)
                    file_size = len(content)
                    loc_stats = self._count_lines_of_code(content, language)
                    
                    self.file_count += 1
                    self.total_size += file_size
                    self.stats[language] += 1
                    
                    # Progress indicator
                    progress = (i / total_files) * 100
                    print(f"\r  Exporting: {progress:.0f}% [{i}/{total_files}]", end='', flush=True)
                    
                    # Write file header with metadata
                    outfile.write(f"\n{'─' * 80}\n")
                    outfile.write(f"FILE {i}/{total_files}: {relative_path}\n")
                    outfile.write(f"Language: {language} | Size: {file_size:,} bytes\n")
                    outfile.write(f"Lines: {loc_stats['total']} total | ")
                    outfile.write(f"{loc_stats['code']} code | ")
                    outfile.write(f"{loc_stats['comment']} comments | ")
                    outfile.write(f"{loc_stats['blank']} blank\n")
                    outfile.write(f"{'─' * 80}\n\n")
                    
                    # Write file content
                    outfile.write(f"```{language}\n")
                    outfile.write(content)
                    if not content.endswith('\n'):
                        outfile.write('\n')
                    outfile.write("```\n\n")
                
                print()  # New line after progress indicator
                
                # Section 3: Statistics & Analysis
                if include_stats:
                    outfile.write("\n3. STATISTICS & ANALYSIS\n")
                    outfile.write("=" * 80 + "\n\n")
                    
                    # General statistics
                    outfile.write("GENERAL STATISTICS\n")
                    outfile.write("-" * 40 + "\n")
                    outfile.write(f"Total files exported: {self.file_count}\n")
                    outfile.write(f"Total size: {self.total_size:,} bytes ")
                    outfile.write(f"({self.total_size / 1024:.2f} KB, ")
                    outfile.write(f"{self.total_size / 1024 / 1024:.2f} MB)\n")
                    outfile.write(f"Average file size: {self.total_size / max(1, self.file_count):,.0f} bytes\n\n")
                    
                    # Language distribution
                    outfile.write("LANGUAGE DISTRIBUTION\n")
                    outfile.write("-" * 40 + "\n")
                    for lang, count in sorted(self.stats.items(), key=lambda x: x[1], reverse=True):
                        percentage = (count / self.file_count) * 100
                        bar = '█' * int(percentage / 2)
                        outfile.write(f"{lang:15} {count:4} files ({percentage:5.1f}%) {bar}\n")
                    
                    # Duplicate detection
                    duplicates = self._find_duplicates()
                    if duplicates:
                        outfile.write("\nDUPLICATE FILES DETECTED\n")
                        outfile.write("-" * 40 + "\n")
                        for hash_val, files in duplicates.items():
                            outfile.write(f"\nHash: {hash_val}\n")
                            for file in files:
                                outfile.write(f"  • {file}\n")
                        outfile.write(f"\nTotal duplicate groups: {len(duplicates)}\n")
                    
                    # Export metadata
                    outfile.write("\nEXPORT METADATA\n")
                    outfile.write("-" * 40 + "\n")
                    outfile.write(f"Export tool: Advanced Project Code Exporter v2.0\n")
                    outfile.write(f"Export date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
                    outfile.write(f"Python version: {sys.version}\n")
                    outfile.write(f"Platform: {sys.platform}\n")
                
                # Final footer
                outfile.write("\n" + "=" * 80 + "\n")
                outfile.write("END OF EXPORT\n")
                outfile.write("=" * 80 + "\n")
            
            print(f"\n✅ Successfully exported {self.file_count} files to: {self.output_file}")
            print(f"📊 Total size: {self.total_size:,} bytes ({self.total_size / 1024:.2f} KB)")
            
            # Show statistics summary
            print("\n📈 Language Distribution:")
            for lang, count in sorted(self.stats.items(), key=lambda x: x[1], reverse=True)[:5]:
                print(f"  • {lang}: {count} files")
            
            return True
            
        except Exception as e:
            print(f"\n❌ Error during export: {str(e)}")
            import traceback
            traceback.print_exc()
            return False


def main():
    parser = argparse.ArgumentParser(
        description='Advanced Project Code Exporter with analytics',
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    
    parser.add_argument('-p', '--project', default='.',
                       help='Project root directory')
    parser.add_argument('-o', '--output', default=None,
                       help='Output filename')
    parser.add_argument('--structure-only', action='store_true',
                       help='Only export tree structure')
    parser.add_argument('--no-stats', action='store_true',
                       help='Do not include statistics')
    parser.add_argument('-e', '--exclude', default='',
                       help='Additional directories to exclude')
    parser.add_argument('--max-depth', type=int, default=10,
                       help='Maximum tree depth')
    
    args = parser.parse_args()
    
    # Create exporter
    exporter = AdvancedProjectExporter(args.project, args.output)
    
    # Add custom exclusions
    if args.exclude:
        custom_excludes = {d.strip() for d in args.exclude.split(',') if d.strip()}
        exporter.EXCLUDE_DIRS.update(custom_excludes)
    
    # Run export
    success = exporter.export(
        include_structure_only=args.structure_only,
        include_stats=not args.no_stats
    )
    
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
