import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		include: ['src/_tests/**/*.test.ts'],
		globals: false,
		environment: 'node',
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			exclude: [
				'node_modules/',
				'src/_tests/',
			],
		},
	},
})
