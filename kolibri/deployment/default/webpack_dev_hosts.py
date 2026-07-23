import os


def webpack_dev_server_hosts(port=None):
    """
    Hosts allowed for webpack-dev-server assets in development CSP.

    Include both localhost and 127.0.0.1: on Windows/WSL, localhost often
    resolves to IPv6 while webpack binds to 127.0.0.1.
    """
    port = port or os.environ.get("WEBPACK_DEV_SERVER_PORT", "3000")
    return (
        f"localhost:{port}",
        f"127.0.0.1:{port}",
    )
