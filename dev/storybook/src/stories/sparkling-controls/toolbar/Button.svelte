<script lang="ts">
  import { createEventDispatcher } from 'svelte'

	export let disabled: boolean = false
	export let selected: boolean = false
	export let style: string = ''

	export let label: string = ''

  const dispatch = createEventDispatcher();
  function onClick(event) {
    dispatch('click', event);
  }
</script>

<button
	type="button"
	class="crm-toolbar-button small"
	style="{style}"
	class:selected
	disabled="{disabled}"
	on:click={onClick}
>
	{label}
	<slot />
</button>

<style lang="scss">
	.crm-toolbar-button {
		display: inline-block;
		border: 0px solid currentColor;
		border-radius: 2px;
		margin: 4px;
		padding: 0.5em 1em 0.5em;
		box-sizing: border-box;
		cursor: pointer;
		user-select: none;
		text-align: center;

		font: inherit;
		font-weight: 400;

		color: inherit;
		background-color: inherit;

		&:focus {
			outline: none;
			border-color: var(--theme-doclink-color);
			box-shadow: inset 0px 0px 2px 0px var(--theme--theme-doclink-color);
		}
		&.selected {
			background-color: var(--theme-bg-dark-color);
			font-weight: bold;
			// background-color: darken(--theme-doclink-color, 10%);
		}

		&:hover:enabled {
			color: var(--theme-caption-color);
			border-color: var(--theme-doclink-color);
			// color: $highlight-color;
			background-color: var(--theme-bg-dark-color);
			// background-color: darken($highlight-color, 30%);
		}
	}
</style>
