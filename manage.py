#!/usr/bin/env python3
"""
Onboarding Diary Application Manager

Usage:
    python manage.py start       Start both backend and frontend
    python manage.py stop        Stop both backend and frontend
    python manage.py restart     Restart both backend and frontend
    python manage.py start-be    Start backend only
    python manage.py start-fe    Start frontend only
    python manage.py stop-be     Stop backend only
    python manage.py stop-fe     Stop frontend only
    python manage.py clean       Clean build artifacts and node_modules
    python manage.py build       Build both backend and frontend
    python manage.py install     Install dependencies for both
    python manage.py status      Show running status of services
"""

import argparse
import os
import signal
import subprocess
import sys
import time

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")
FRONTEND_DIR = os.path.join(ROOT_DIR, "frontend")
PID_DIR = os.path.join(ROOT_DIR, ".pids")

BACKEND_PID_FILE = os.path.join(PID_DIR, "backend.pid")
FRONTEND_PID_FILE = os.path.join(PID_DIR, "frontend.pid")


def ensure_pid_dir():
    """Create PID directory if it doesn't exist."""
    os.makedirs(PID_DIR, exist_ok=True)


def write_pid(pid_file, pid):
    """Write a PID to file."""
    ensure_pid_dir()
    with open(pid_file, "w") as f:
        f.write(str(pid))


def read_pid(pid_file):
    """Read a PID from file. Returns None if file doesn't exist."""
    if not os.path.exists(pid_file):
        return None
    try:
        with open(pid_file, "r") as f:
            return int(f.read().strip())
    except (ValueError, FileNotFoundError):
        return None


def is_process_running(pid):
    """Check if a process with given PID is running."""
    if pid is None:
        return False
    try:
        os.kill(pid, 0)
        return True
    except OSError:
        return False


def remove_pid_file(pid_file):
    """Remove a PID file if it exists."""
    if os.path.exists(pid_file):
        os.remove(pid_file)


def stop_process(pid_file, name):
    """Stop a process by its PID file."""
    pid = read_pid(pid_file)
    if pid is None or not is_process_running(pid):
        print(f"  {name} is not running.")
        remove_pid_file(pid_file)
        return

    print(f"  Stopping {name} (PID: {pid})...")
    try:
        os.killpg(os.getpgid(pid), signal.SIGTERM)
    except ProcessLookupError:
        pass

    # Wait up to 10 seconds for graceful shutdown
    for _ in range(20):
        if not is_process_running(pid):
            break
        time.sleep(0.5)

    # Force kill if still running
    if is_process_running(pid):
        print(f"  Force killing {name} (PID: {pid})...")
        try:
            os.killpg(os.getpgid(pid), signal.SIGKILL)
        except ProcessLookupError:
            pass

    remove_pid_file(pid_file)
    print(f"  {name} stopped.")


def run_command(command, cwd, description):
    """Run a command synchronously and print output."""
    print(f"  {description}...")
    result = subprocess.run(
        command,
        cwd=cwd,
        shell=True,
        capture_output=False,
    )
    if result.returncode != 0:
        print(f"  ERROR: {description} failed with exit code {result.returncode}")
        return False
    print(f"  {description} completed.")
    return True


def start_backend():
    """Start the backend server."""
    pid = read_pid(BACKEND_PID_FILE)
    if pid and is_process_running(pid):
        print("  Backend is already running (PID: {}).".format(pid))
        return

    print("  Starting backend...")

    # Run prisma generate first
    run_command("npx prisma generate", BACKEND_DIR, "Generating Prisma client")

    # Run prisma db push to ensure schema is in sync
    run_command("npx prisma db push --skip-generate", BACKEND_DIR, "Syncing database schema")

    # Start the dev server
    log_file = os.path.join(PID_DIR, "backend.log")
    with open(log_file, "w") as log:
        process = subprocess.Popen(
            "npm run dev",
            cwd=BACKEND_DIR,
            shell=True,
            stdout=log,
            stderr=log,
            preexec_fn=os.setsid,
        )

    write_pid(BACKEND_PID_FILE, process.pid)

    # Wait a moment and check if it started
    time.sleep(3)
    if is_process_running(process.pid):
        print(f"  Backend started (PID: {process.pid})")
        print(f"  Backend log: {log_file}")
        print("  Backend URL: http://localhost:3001")
    else:
        print("  ERROR: Backend failed to start. Check logs at: {}".format(log_file))
        remove_pid_file(BACKEND_PID_FILE)


def start_frontend():
    """Start the frontend dev server."""
    pid = read_pid(FRONTEND_PID_FILE)
    if pid and is_process_running(pid):
        print("  Frontend is already running (PID: {}).".format(pid))
        return

    print("  Starting frontend...")

    log_file = os.path.join(PID_DIR, "frontend.log")
    with open(log_file, "w") as log:
        process = subprocess.Popen(
            "npm run dev",
            cwd=FRONTEND_DIR,
            shell=True,
            stdout=log,
            stderr=log,
            preexec_fn=os.setsid,
        )

    write_pid(FRONTEND_PID_FILE, process.pid)

    # Wait a moment and check if it started
    time.sleep(3)
    if is_process_running(process.pid):
        print(f"  Frontend started (PID: {process.pid})")
        print(f"  Frontend log: {log_file}")
        print("  Frontend URL: http://localhost:5173")
    else:
        print("  ERROR: Frontend failed to start. Check logs at: {}".format(log_file))
        remove_pid_file(FRONTEND_PID_FILE)


def cmd_start(args):
    """Start the application."""
    print("[START]")
    start_backend()
    start_frontend()
    print("\nApplication started successfully!")
    print("  Backend:  http://localhost:3001")
    print("  Frontend: http://localhost:5173")


def cmd_stop(args):
    """Stop the application."""
    print("[STOP]")
    stop_process(FRONTEND_PID_FILE, "Frontend")
    stop_process(BACKEND_PID_FILE, "Backend")
    print("\nApplication stopped.")


def cmd_restart(args):
    """Restart the application."""
    print("[RESTART]")
    cmd_stop(args)
    print()
    cmd_start(args)


def cmd_start_be(args):
    """Start backend only."""
    print("[START BACKEND]")
    start_backend()


def cmd_start_fe(args):
    """Start frontend only."""
    print("[START FRONTEND]")
    start_frontend()


def cmd_stop_be(args):
    """Stop backend only."""
    print("[STOP BACKEND]")
    stop_process(BACKEND_PID_FILE, "Backend")


def cmd_stop_fe(args):
    """Stop frontend only."""
    print("[STOP FRONTEND]")
    stop_process(FRONTEND_PID_FILE, "Frontend")


def cmd_clean(args):
    """Clean build artifacts and optionally node_modules."""
    print("[CLEAN]")

    dirs_to_clean = [
        os.path.join(BACKEND_DIR, "dist"),
        os.path.join(FRONTEND_DIR, "dist"),
        os.path.join(BACKEND_DIR, "coverage"),
        os.path.join(FRONTEND_DIR, "coverage"),
    ]

    if args.all:
        dirs_to_clean.extend([
            os.path.join(BACKEND_DIR, "node_modules"),
            os.path.join(FRONTEND_DIR, "node_modules"),
        ])

    for dir_path in dirs_to_clean:
        if os.path.exists(dir_path):
            print(f"  Removing {os.path.relpath(dir_path, ROOT_DIR)}...")
            subprocess.run(f"rm -rf {dir_path}", shell=True)
        else:
            print(f"  Skipping {os.path.relpath(dir_path, ROOT_DIR)} (not found)")

    # Clean PID files
    if os.path.exists(PID_DIR):
        for f in os.listdir(PID_DIR):
            if f.endswith(".log"):
                os.remove(os.path.join(PID_DIR, f))

    print("\nClean completed.")


def cmd_build(args):
    """Build both backend and frontend."""
    print("[BUILD]")

    success = run_command("npm run build", BACKEND_DIR, "Building backend")
    if not success:
        sys.exit(1)

    success = run_command("npm run build", FRONTEND_DIR, "Building frontend")
    if not success:
        sys.exit(1)

    print("\nBuild completed successfully!")


def cmd_install(args):
    """Install dependencies for both backend and frontend."""
    print("[INSTALL]")

    success = run_command("npm install", BACKEND_DIR, "Installing backend dependencies")
    if not success:
        sys.exit(1)

    success = run_command(
        "npx prisma generate", BACKEND_DIR, "Generating Prisma client"
    )
    if not success:
        sys.exit(1)

    success = run_command(
        "npm install --legacy-peer-deps",
        FRONTEND_DIR,
        "Installing frontend dependencies",
    )
    if not success:
        sys.exit(1)

    print("\nAll dependencies installed successfully!")


def cmd_status(args):
    """Show status of running services."""
    print("[STATUS]")

    be_pid = read_pid(BACKEND_PID_FILE)
    fe_pid = read_pid(FRONTEND_PID_FILE)

    be_running = is_process_running(be_pid)
    fe_running = is_process_running(fe_pid)

    print(
        f"  Backend:  {'RUNNING (PID: ' + str(be_pid) + ')' if be_running else 'STOPPED'}"
    )
    print(
        f"  Frontend: {'RUNNING (PID: ' + str(fe_pid) + ')' if fe_running else 'STOPPED'}"
    )

    # Clean up stale PID files
    if not be_running and be_pid is not None:
        remove_pid_file(BACKEND_PID_FILE)
    if not fe_running and fe_pid is not None:
        remove_pid_file(FRONTEND_PID_FILE)


def main():
    parser = argparse.ArgumentParser(
        description="Onboarding Diary Application Manager",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python manage.py start          Start both backend and frontend
  python manage.py stop           Stop both backend and frontend
  python manage.py restart        Restart the entire application
  python manage.py start-be       Start backend only
  python manage.py start-fe       Start frontend only
  python manage.py stop-be        Stop backend only
  python manage.py stop-fe        Stop frontend only
  python manage.py clean          Clean build artifacts
  python manage.py clean --all    Clean build artifacts and node_modules
  python manage.py build          Build both projects
  python manage.py install        Install all dependencies
  python manage.py status         Show running status
        """,
    )

    subparsers = parser.add_subparsers(dest="command", help="Command to execute")
    subparsers.required = True

    subparsers.add_parser("start", help="Start both backend and frontend").set_defaults(func=cmd_start)
    subparsers.add_parser("stop", help="Stop both backend and frontend").set_defaults(func=cmd_stop)
    subparsers.add_parser("restart", help="Restart both backend and frontend").set_defaults(func=cmd_restart)
    subparsers.add_parser("start-be", help="Start backend only").set_defaults(func=cmd_start_be)
    subparsers.add_parser("start-fe", help="Start frontend only").set_defaults(func=cmd_start_fe)
    subparsers.add_parser("stop-be", help="Stop backend only").set_defaults(func=cmd_stop_be)
    subparsers.add_parser("stop-fe", help="Stop frontend only").set_defaults(func=cmd_stop_fe)

    clean_parser = subparsers.add_parser("clean", help="Clean build artifacts")
    clean_parser.add_argument("--all", action="store_true", help="Also remove node_modules")
    clean_parser.set_defaults(func=cmd_clean)

    subparsers.add_parser("build", help="Build both projects").set_defaults(func=cmd_build)
    subparsers.add_parser("install", help="Install all dependencies").set_defaults(func=cmd_install)
    subparsers.add_parser("status", help="Show running status").set_defaults(func=cmd_status)

    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
