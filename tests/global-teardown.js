async function globalTeardown() {
	if ( global.__PLAYWRIGHT_SERVER__ ) {
		try {
			await global.__PLAYWRIGHT_SERVER__.close();
		} catch ( e ) {
			console.warn( 'Failed to close Playground server:', e.message );
		}
	}
}

module.exports = globalTeardown;
