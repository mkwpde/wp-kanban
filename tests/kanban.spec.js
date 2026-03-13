const { test, expect } = require( '@playwright/test' );

test( 'Kanban board page loads', async ( { page } ) => {
	// Navigate to the Kanban board page
	await page.goto( '/kanban-board/' );

	// Wait for the page to load
	await page.waitForLoadState( 'domcontentloaded' );

	// Check that we have a kanban board on the page
	const kanbanBlock = page.locator( '.wp-block-mfgmicha-kanban-board' );

	// Log if not found for debugging
	if ( await kanbanBlock.count() === 0 ) {
		const bodyHTML = await page.locator( 'body' ).innerHTML();
		console.log( 'Page content:', bodyHTML.substring( 0, 500 ) );
	}

	// Expect the kanban board to be visible
	await expect( kanbanBlock ).toBeVisible();
} );
