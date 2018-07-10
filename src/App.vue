<template>
	<div id="app">
		<navbar></navbar>
		<router-view class="view"></router-view>
	</div>
</template>

<script>
	import NavBar from './components/NavBar.vue'
	export default {
		name:'app',
		components:{'navbar':NavBar},
		data () {
			return {
				msg:'Cacophony'
			}
		}
	}
</script>
