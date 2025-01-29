<script>
  import "../app.css";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { ToastContainer, FlatToast } from "svelte-toasts";

  onMount(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      goto("/login");
    }
  });
</script>

<ToastContainer let:data={data}>
  <FlatToast {data} />
</ToastContainer>
<slot />
