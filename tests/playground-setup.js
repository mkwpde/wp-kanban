const { runCLI } = require( '@wp-playground/cli' );
const path = require( 'path' );

const projectRoot = path.resolve( __dirname, '..' );

/**
 * Start WordPress Playground server for testing
 * @return {Promise<{close: () => Promise<void>, url: string}>}
 */
async function startPlaygroundServer() {
	console.log( 'Starting WordPress Playground...' );

	let server;
	try {
		server = await runCLI( {
			command: 'server',
			php: '8.4',
			wp: 'latest',
			port: 8890,
			mount: [
				{
					hostPath: projectRoot,
					vfsPath: '/wordpress/wp-content/plugins/wp-kanban',
				},
			],
			blueprint: {
				preferredVersions: { wp: 'latest', php: '8.4' },
				steps: [
					{
						step: 'activatePlugin',
						pluginPath: 'wp-kanban/plugin.php',
					},
					{
						step: 'wp-cli',
						command:
							"wp post create --post_type=page --post_title='Kanban Board' --post_name=kanban-board --post_content='<!-- wp:mfgmicha/kanban-board /-->' --post_status=publish",
					},
				],
			},
		} );
	} catch ( e ) {
		console.error( 'Failed to start Playground:', e.message );
		throw e;
	}

	console.log( `Playground started at ${ server?.url || server?.address?.() }` );

	return {
		close: async () => {
			console.log( 'Stopping WordPress Playground...' );
			try {
				if ( server.close ) {
					await server.close();
				}
			} catch ( e ) {
				console.warn( 'Error closing server:', e.message );
			}
		},
		url: server?.url || `http://127.0.0.1:8890`,
	};
}

module.exports = { startPlaygroundServer };
