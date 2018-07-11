<template>
	<div>
		<Hero/>
		<b-container>
			Home
		</b-container>
	</div>
</template>

<script>

import Hero from '../components/Hero.vue'

	export default {
		// https://vuejs.org/v2/style-guide/#Multi-word-component-names-essential
		name:'home-view',
		// https://vuejs.org/v2/style-guide/#Component-data-essential
		data () {
			return {}
		},
		// https://vuejs.org/v2/style-guide/#Simple-computed-properties-strongly-recommended
		computed:{},
		// https://vuejs.org/v2/style-guide/#Prop-definitions-essential
		props:{},
		components: {
			Hero
		}
	}
</script>
