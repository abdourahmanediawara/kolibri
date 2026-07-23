"""
Regression: Learn splash on Windows/WSL when webpack assets use 127.0.0.1.

See AE_KOLIBRI_PATCHES.md (Patch 001).
"""
from kolibri.deployment.default.webpack_dev_hosts import webpack_dev_server_hosts


def test_webpack_dev_server_hosts_include_127_and_localhost():
    hosts = webpack_dev_server_hosts("3000")
    assert "127.0.0.1:3000" in hosts
    assert "localhost:3000" in hosts


def test_webpack_dev_server_hosts_respect_custom_port():
    hosts = webpack_dev_server_hosts("3100")
    assert hosts == ("localhost:3100", "127.0.0.1:3100")
