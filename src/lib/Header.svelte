<script>
  import { Navbar, NavBrand, NavLi, NavUl } from "flowbite-svelte";
  import { goto } from "$app/navigation";
  import { toasts } from "svelte-toasts";

  const logout = () => {
    localStorage.removeItem("token");
    toasts.add({
          title: "Success",
          description: "Logout successful",
          duration: 3000,
          placement: "top-right",
          type: "success",
          theme: "dark",
        });
    goto("/login");
  };
</script>

<header class="bg-[#3e6380] border-b sticky top-0 z-10">
  <Navbar>
    <!-- Brand -->
    <NavBrand href="/template-management">
      <img
        src="/img/fidelity_logo.jpeg"
        class="mr-3 h-6 sm:h-9"
        alt="Fidelity National Financial Logo"
      />
    </NavBrand>

    <NavUl>
      <NavLi href="/template-dashboard" activeClass="text-indigo-500">
        Template Management
      </NavLi>
      <NavLi
        on:click={logout}
        activeClass="text-indigo-500"
        class="cursor-pointer"
      >
        Logout
      </NavLi>
    </NavUl>
  </Navbar>
</header>
