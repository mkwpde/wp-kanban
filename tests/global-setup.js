const { startPlaygroundServer } = require( './playground-setup' );

async function globalSetup() {
	const server = await startPlaygroundServer();
	// Store server reference in global for teardown
	global.__PLAYWRIGHT_SERVER__ = server;
}

module.exports = globalSetup;
