<template>
  <div class="hero"/>
</template>

<script>

</script>

<style>
.hero {
  background-image: url('../assets/hero/hero-theory.jpg');
  background-position: center;
  background-repeat: no-repeat;
  background-color: transparent;
  background-size: cover;
  position: relative;
}

/* Mobiles */
.hero {
  height: 70px;
  width: 100%;
  object-fit: contain;
}

/* Large screens */
@media only screen and (min-width: 768px) {
  .hero {
    height: 360px;
  }
}
</style>
