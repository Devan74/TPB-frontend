<script>
  import "../app.css";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";

  onMount(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      goto("/login");
    }
  });
</script>

<slot />
