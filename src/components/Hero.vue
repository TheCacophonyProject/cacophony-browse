<template>
  <div class="hero">
  </div>
</template>

<script>

</script>

<style>
.hero {
  background-image: url('../assets/hero/hero-theory.jpg');
  background-position: center;
  background-repeat: no-repeat;
  background-color: transparent;
  position: relative;
  margin-top: -15px;
  margin-bottom: 15px;
}

/* Mobiles */
.hero {
  height: 200px;
}

/* Large screens */
@media only screen and (min-width: 768px) {
  .hero {
    height: 360px;
  }
}
</style>
