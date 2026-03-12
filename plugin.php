<?php
/**
 * Plugin Name:       Kanban Board Block
 * Description:       A fully interactive Kanban board block with drag-and-drop task management, powered by a custom post type, taxonomy, and the Interactivity API.
 * Version:           0.1.0
 * Requires at least: 6.6
 * Requires PHP:      7.4
 * Author:            WordPress Telex
 * License:           GPLv2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       telex-kanban-board
 *
 * @package TelexKanbanBoard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Register the block.
 */
if ( ! function_exists( 'telex_kanban_board_block_init' ) ) {
	function telex_kanban_board_block_init() {
		register_block_type( __DIR__ . '/build' );
	}
}
add_action( 'init', 'telex_kanban_board_block_init' );

/**
 * Register the kanban_task custom post type.
 */
if ( ! function_exists( 'telex_kanban_board_register_cpt' ) ) {
	function telex_kanban_board_register_cpt() {
		$labels = array(
			'name'               => __( 'Tasks', 'telex-kanban-board' ),
			'singular_name'      => __( 'Task', 'telex-kanban-board' ),
			'add_new'            => __( 'Add New Task', 'telex-kanban-board' ),
			'add_new_item'       => __( 'Add New Task', 'telex-kanban-board' ),
			'edit_item'          => __( 'Edit Task', 'telex-kanban-board' ),
			'new_item'           => __( 'New Task', 'telex-kanban-board' ),
			'view_item'          => __( 'View Task', 'telex-kanban-board' ),
			'search_items'       => __( 'Search Tasks', 'telex-kanban-board' ),
			'not_found'          => __( 'No tasks found', 'telex-kanban-board' ),
			'not_found_in_trash' => __( 'No tasks found in Trash', 'telex-kanban-board' ),
			'menu_name'          => __( 'Tasks', 'telex-kanban-board' ),
		);

		$args = array(
			'labels'       => $labels,
			'public'       => false,
			'show_ui'      => true,
			'show_in_rest' => true,
			'rest_base'    => 'kanban-tasks',
			'menu_icon'    => 'dashicons-clipboard',
			'supports'     => array( 'title', 'excerpt', 'custom-fields' ),
			'has_archive'  => false,
		);

		register_post_type( 'kanban_task', $args );
	}
}
add_action( 'init', 'telex_kanban_board_register_cpt' );

/**
 * Register the kanban_column taxonomy.
 */
if ( ! function_exists( 'telex_kanban_board_register_taxonomy' ) ) {
	function telex_kanban_board_register_taxonomy() {
		$labels = array(
			'name'          => __( 'Columns', 'telex-kanban-board' ),
			'singular_name' => __( 'Column', 'telex-kanban-board' ),
			'add_new_item'  => __( 'Add New Column', 'telex-kanban-board' ),
			'edit_item'     => __( 'Edit Column', 'telex-kanban-board' ),
			'search_items'  => __( 'Search Columns', 'telex-kanban-board' ),
			'menu_name'     => __( 'Columns', 'telex-kanban-board' ),
		);

		$args = array(
			'labels'            => $labels,
			'public'            => false,
			'show_ui'           => true,
			'show_in_rest'      => true,
			'rest_base'         => 'kanban-columns',
			'hierarchical'      => false,
			'show_admin_column' => true,
		);

		register_taxonomy( 'kanban_column', 'kanban_task', $args );
	}
}
add_action( 'init', 'telex_kanban_board_register_taxonomy' );

/**
 * Register the menu_order meta field for REST API access.
 */
if ( ! function_exists( 'telex_kanban_board_register_meta' ) ) {
	function telex_kanban_board_register_meta() {
		register_post_meta(
			'kanban_task',
			'kanban_order',
			array(
				'show_in_rest'  => true,
				'single'        => true,
				'type'          => 'integer',
				'default'       => 0,
				'auth_callback' => function () {
					return current_user_can( 'edit_posts' );
				},
			)
		);
	}
}
add_action( 'init', 'telex_kanban_board_register_meta' );

/**
 * Register custom REST endpoints.
 */
if ( ! function_exists( 'telex_kanban_board_register_rest_routes' ) ) {
	function telex_kanban_board_register_rest_routes() {
		register_rest_route(
			'telex-kanban/v1',
			'/move-task',
			array(
				'methods'             => 'POST',
				'callback'            => 'telex_kanban_board_move_task',
				'permission_callback' => function () {
					return current_user_can( 'edit_posts' );
				},
				'args'                => array(
					'task_id'   => array(
						'required'          => true,
						'type'              => 'integer',
						'sanitize_callback' => 'absint',
					),
					'column_id' => array(
						'required'          => true,
						'type'              => 'integer',
						'sanitize_callback' => 'absint',
					),
					'order'     => array(
						'required'          => false,
						'type'              => 'integer',
						'default'           => 0,
						'sanitize_callback' => 'absint',
					),
				),
			)
		);

		register_rest_route(
			'telex-kanban/v1',
			'/create-task',
			array(
				'methods'             => 'POST',
				'callback'            => 'telex_kanban_board_create_task',
				'permission_callback' => function () {
					return current_user_can( 'edit_posts' );
				},
				'args'                => array(
					'title'       => array(
						'required'          => true,
						'type'              => 'string',
						'sanitize_callback' => 'sanitize_text_field',
					),
					'description' => array(
						'required'          => false,
						'type'              => 'string',
						'default'           => '',
						'sanitize_callback' => 'sanitize_textarea_field',
					),
					'column_id'   => array(
						'required'          => true,
						'type'              => 'integer',
						'sanitize_callback' => 'absint',
					),
				),
			)
		);

		register_rest_route(
			'telex-kanban/v1',
			'/delete-task',
			array(
				'methods'             => 'POST',
				'callback'            => 'telex_kanban_board_delete_task',
				'permission_callback' => function () {
					return current_user_can( 'edit_posts' );
				},
				'args'                => array(
					'task_id' => array(
						'required'          => true,
						'type'              => 'integer',
						'sanitize_callback' => 'absint',
					),
				),
			)
		);

		register_rest_route(
			'telex-kanban/v1',
			'/reorder',
			array(
				'methods'             => 'POST',
				'callback'            => 'telex_kanban_board_reorder_tasks',
				'permission_callback' => function () {
					return current_user_can( 'edit_posts' );
				},
				'args'                => array(
					'tasks' => array(
						'required' => true,
						'type'     => 'array',
					),
				),
			)
		);
	}
}
add_action( 'rest_api_init', 'telex_kanban_board_register_rest_routes' );

/**
 * Callback for moving a task to a new column.
 */
if ( ! function_exists( 'telex_kanban_board_move_task' ) ) {
	function telex_kanban_board_move_task( $request ) {
		$task_id   = $request->get_param( 'task_id' );
		$column_id = $request->get_param( 'column_id' );
		$order     = $request->get_param( 'order' );

		$post = get_post( $task_id );
		if ( ! $post || 'kanban_task' !== $post->post_type ) {
			return new WP_Error( 'invalid_task', __( 'Invalid task.', 'telex-kanban-board' ), array( 'status' => 404 ) );
		}

		$term = get_term( $column_id, 'kanban_column' );
		if ( ! $term || is_wp_error( $term ) ) {
			return new WP_Error( 'invalid_column', __( 'Invalid column.', 'telex-kanban-board' ), array( 'status' => 404 ) );
		}

		wp_set_object_terms( $task_id, array( $column_id ), 'kanban_column' );
		update_post_meta( $task_id, 'kanban_order', $order );

		return rest_ensure_response(
			array(
				'success' => true,
				'task_id' => $task_id,
				'column'  => $column_id,
				'order'   => $order,
			)
		);
	}
}

/**
 * Callback for creating a new task.
 */
if ( ! function_exists( 'telex_kanban_board_create_task' ) ) {
	function telex_kanban_board_create_task( $request ) {
		$title       = $request->get_param( 'title' );
		$description = $request->get_param( 'description' );
		$column_id   = $request->get_param( 'column_id' );

		$post_id = wp_insert_post(
			array(
				'post_type'    => 'kanban_task',
				'post_title'   => $title,
				'post_excerpt' => $description,
				'post_status'  => 'publish',
			)
		);

		if ( is_wp_error( $post_id ) ) {
			return $post_id;
		}

		wp_set_object_terms( $post_id, array( $column_id ), 'kanban_column' );
		update_post_meta( $post_id, 'kanban_order', 999 );

		return rest_ensure_response(
			array(
				'success' => true,
				'task'    => array(
					'id'          => $post_id,
					'title'       => $title,
					'description' => $description,
					'column_id'   => $column_id,
					'order'       => 999,
				),
			)
		);
	}
}

/**
 * Callback for deleting a task.
 */
if ( ! function_exists( 'telex_kanban_board_delete_task' ) ) {
	function telex_kanban_board_delete_task( $request ) {
		$task_id = $request->get_param( 'task_id' );

		$post = get_post( $task_id );
		if ( ! $post || 'kanban_task' !== $post->post_type ) {
			return new WP_Error( 'invalid_task', __( 'Invalid task.', 'telex-kanban-board' ), array( 'status' => 404 ) );
		}

		wp_delete_post( $task_id, true );

		return rest_ensure_response(
			array(
				'success' => true,
				'task_id' => $task_id,
			)
		);
	}
}

/**
 * Callback for bulk reordering tasks.
 */
if ( ! function_exists( 'telex_kanban_board_reorder_tasks' ) ) {
	function telex_kanban_board_reorder_tasks( $request ) {
		$tasks = $request->get_param( 'tasks' );

		if ( ! is_array( $tasks ) ) {
			return new WP_Error( 'invalid_data', __( 'Invalid tasks data.', 'telex-kanban-board' ), array( 'status' => 400 ) );
		}

		foreach ( $tasks as $task_data ) {
			if ( ! isset( $task_data['id'], $task_data['order'] ) ) {
				continue;
			}
			$task_id = absint( $task_data['id'] );
			$order   = absint( $task_data['order'] );

			$post = get_post( $task_id );
			if ( $post && 'kanban_task' === $post->post_type ) {
				update_post_meta( $task_id, 'kanban_order', $order );
				if ( isset( $task_data['column_id'] ) ) {
					wp_set_object_terms( $task_id, array( absint( $task_data['column_id'] ) ), 'kanban_column' );
				}
			}
		}

		return rest_ensure_response( array( 'success' => true ) );
	}
}

/**
 * Helper: Get all kanban board data.
 */
if ( ! function_exists( 'telex_kanban_board_get_data' ) ) {
	function telex_kanban_board_get_data() {
		$columns = get_terms(
			array(
				'taxonomy'   => 'kanban_column',
				'hide_empty' => false,
				'orderby'    => 'name',
				'order'      => 'ASC',
			)
		);

		if ( is_wp_error( $columns ) ) {
			$columns = array();
		}

		$board = array();

		foreach ( $columns as $column ) {
			$tasks_query = new WP_Query(
				array(
					'post_type'      => 'kanban_task',
					'post_status'    => 'publish',
					'posts_per_page' => 100,
					'tax_query'      => array(
						array(
							'taxonomy' => 'kanban_column',
							'field'    => 'term_id',
							'terms'    => $column->term_id,
						),
					),
					'meta_key'       => 'kanban_order',
					'orderby'        => 'meta_value_num',
					'order'          => 'ASC',
				)
			);

			$tasks = array();
			if ( $tasks_query->have_posts() ) {
				while ( $tasks_query->have_posts() ) {
					$tasks_query->the_post();
					$tasks[] = array(
						'id'          => get_the_ID(),
						'title'       => get_the_title(),
						'description' => get_the_excerpt(),
						'order'       => (int) get_post_meta( get_the_ID(), 'kanban_order', true ),
					);
				}
				wp_reset_postdata();
			}

			$board[] = array(
				'id'    => $column->term_id,
				'name'  => $column->name,
				'slug'  => $column->slug,
				'tasks' => $tasks,
			);
		}

		return $board;
	}
}