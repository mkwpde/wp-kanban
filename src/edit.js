import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';
import { Spinner, Placeholder } from '@wordpress/components';
import { useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import './editor.scss';

export default function Edit() {
	const blockProps = useBlockProps();
	const [ board, setBoard ] = useState( null );
	const [ loading, setLoading ] = useState( true );

	useEffect( () => {
		async function fetchBoard() {
			try {
				const columns = await apiFetch( {
					path: '/mfgmicha-kanban/v1/columns',
				} );

				if ( ! columns || columns.length === 0 ) {
					setBoard( [] );
					setLoading( false );
					return;
				}

				const boardData = [];

				for ( const col of columns ) {
					let tasks = [];
					try {
						tasks = await apiFetch( {
							path: `/wp/v2/kanban-tasks?kanban_column=${ col.id }&per_page=100&orderby=meta_value_num&meta_key=kanban_order`,
						} );
					} catch ( e ) {
						tasks = [];
					}

					boardData.push( {
						id: col.id,
						name: col.name,
						tasks: Array.isArray( tasks )
							? tasks.map( ( t ) => ( {
									id: t.id,
									title:
										t.title?.rendered ||
										t.title?.raw ||
										'',
									description:
										t.excerpt?.rendered ||
										t.excerpt?.raw ||
										'',
							  } ) )
							: [],
					} );
				}

				setBoard( boardData );
			} catch ( err ) {
				setBoard( [] );
			}
			setLoading( false );
		}

		fetchBoard();
	}, [] );

	if ( loading ) {
		return (
			<div { ...blockProps }>
				<Placeholder
					icon="clipboard"
					label={ __( 'Kanban Board', 'mfgmicha-kanban-board' ) }
				>
					<Spinner />
					<p>
						{ __(
							'Loading board data...',
							'mfgmicha-kanban-board'
						) }
					</p>
				</Placeholder>
			</div>
		);
	}

	if ( ! board || board.length === 0 ) {
		return (
			<div { ...blockProps }>
				<Placeholder
					icon="clipboard"
					label={ __( 'Kanban Board', 'mfgmicha-kanban-board' ) }
					instructions={ __(
						'No columns found. Create columns under Tasks > Columns in the admin, then add tasks.',
						'mfgmicha-kanban-board'
					) }
				/>
			</div>
		);
	}

	return (
		<div { ...blockProps }>
			<div className="kanban-board-preview">
				{ board.map( ( column ) => (
					<div key={ column.id } className="kanban-column-preview">
						<div className="kanban-column-header-preview">
							<h3>{ column.name }</h3>
							<span className="kanban-count-preview">
								{ column.tasks.length }
							</span>
						</div>
						<div className="kanban-cards-preview">
							{ column.tasks.length === 0 && (
								<p className="kanban-empty-preview">
									{ __(
										'No tasks yet',
										'mfgmicha-kanban-board'
									) }
								</p>
							) }
							{ column.tasks.map( ( task ) => (
								<div
									key={ task.id }
									className="kanban-card-preview"
								>
									<div className="kanban-card-title-preview">
										{ task.title }
									</div>
									{ task.description && (
										<div
											className="kanban-card-desc-preview"
											dangerouslySetInnerHTML={ {
												__html: task.description,
											} }
										/>
									) }
								</div>
							) ) }
						</div>
					</div>
				) ) }
			</div>
		</div>
	);
}