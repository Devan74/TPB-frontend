<script>
  import { dndzone } from "svelte-dnd-action";
  import { fade } from "svelte/transition";
  import axios from 'axios';
  import { flip } from "svelte/animate";
  import { toasts } from "svelte-toasts";
  import { goto } from "$app/navigation";

  const fieldTypes = {
    input: { icon: '📝', label: 'Text Input' },
    textarea: { icon: '📋', label: 'Textarea' },
    checkbox: { icon: '☑️', label: 'Checkbox' },
    radio: { icon: '⭕', label: 'Radio' },
    dropdown: { icon: '🔽', label: 'Dropdown' },
    date: { icon: '📅', label: 'Date' },
    time: { icon: '🕒', label: 'Time' },
    number: { icon: '🔢', label: 'Number' },
    email: { icon: '📧', label: 'Email' },
    tel: { icon: '📞', label: 'Telephone' },
    divider: { icon: '➖', label: 'Divider' },
    title: { icon: 'Ab', label: 'Title' }
  };

  let formName = "Untitled Form";
  let fields = [];
  let selectedField = null;
  let formStatus = 'active';

  const inputTypes = [
    "text", "number", "email", "password", "tel", "url", "date", "time"
  ];

  function handleDndConsider(e) {
    fields = e.detail.items;
  }

  function handleDndFinalize(e) {
    fields = e.detail.items;
  }

  function handleDrop(e) {
    e.preventDefault();
    const fieldType = e.dataTransfer?.getData("text/plain");
    if (fieldType && fieldTypes[fieldType]) {
      addField(fieldType);
    }
  }

  function addField(fieldType) {
    const newField = {
      id: `${fieldType}-${Date.now()}`,
      type: fieldType,
      properties: {
        label: `${fieldTypes[fieldType].label} ${fields.length + 1}`,
        name: `${fieldType}-${fields.length + 1}`,
      },
      attributes: {
        type: fieldType === 'input' ? 'text' : fieldType,
        placeholder: `Enter ${fieldTypes[fieldType].label.toLowerCase()}`,
      },
      options: ['dropdown', 'radio', 'checkbox'].includes(fieldType) ? [
        { label: 'Option 1', value: '1' },
        { label: 'Option 2', value: '2' },
      ] : undefined,
      layout: ['radio', 'checkbox'].includes(fieldType) ? { inline: false } : undefined,
      validation: {},
    };
    fields = [...fields, newField];
  }

  function updateField(field, path, value) {
    const updatedField = { ...field };
    const parts = path.split('.');
    let current = updatedField;
    
    for (let i = 0; i < parts.length - 1; i++) {
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
    
    fields = fields.map(f => f.id === field.id ? updatedField : f);
    selectedField = updatedField;
  }

  function addOption(field) {
    const options = [...(field.options || [])];
    const newOption = {
      label: `Option ${options.length + 1}`,
      value: `${options.length + 1}`
    };
    options.push(newOption);
    updateField(field, 'options', options);
  }

  function removeOption(field, index) {
    const options = [...field.options];
    options.splice(index, 1);
    updateField(field, 'options', options);
  }

  function removeField(fieldId) {
    fields = fields.filter(f => f.id !== fieldId);
    if (selectedField?.id === fieldId) {
      selectedField = null;
    }
  }

  async function saveForm() {
    try {
      const formData = {
        formName,
        fields: fields.map(({ id, ...field }) => field),
        status: formStatus,
      };

      const response = await axios.post('http://localhost:8000/api/forms', formData);
      toasts.add({
        title: "Success",
        description: "Form Saved successfully",
        duration: 3000,
        placement: "top-center",
        type: "success",
        theme: "dark",
      });
      goto("/template-management");
    } catch (error) {
      console.error('Error saving form:', error);
      toasts.add({
        title: "Error",
        description: "Failed to save form",
        duration: 3000,
        placement: "top-center",
        type: "error",
        theme: "dark",
      });
    }
  }

  function updateValidation(field, key, value) {
    const validation = { ...field.validation, [key]: value };
    updateField(field, 'validation', validation);
  }

  function toggleFormStatus() {
    formStatus = formStatus === "active" ? "inactive" : "active";
  }
</script>

<div class="h-screen bg-gray-50">
  <div class="flex">
    <!-- Left Sidebar - Form Fields -->
    <div class="w-64 bg-gradient-to-br from-white via-gray-50 to-gray-100 border-r border-gray-300 overflow-y-auto shadow-md">
      <div class="p-4">
        <h2 class="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
          Form Fields
        </h2>
        <div class="grid grid-cols-2 gap-3">
          {#each Object.entries(fieldTypes) as [type, { icon, label }]}
            <div
              class="flex flex-col items-center p-4 bg-gradient-to-br from-indigo-100 via-indigo-50 to-white rounded-xl border border-gray-300 hover:border-indigo-500 hover:shadow-lg cursor-pointer transition-all duration-200"
              draggable="true"
              on:dragstart={e => e.dataTransfer.setData("text/plain", type)}
              on:click={() => addField(type)}
            >
              <span class="text-xl font-semibold text-indigo-600 mb-2">{icon}</span>
              <span class="text-sm font-medium text-gray-700">{label}</span>
            </div>
          {/each}
        </div>
      </div>
    </div>
    
    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Form Name and Save Button -->
      <div class="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <input
          type="text"
          bind:value={formName}
          class="text-xl font-semibold text-gray-900 border-none focus:ring-2 focus:ring-indigo-500 rounded px-2 py-1"
          placeholder="Enter template name"
        />
        <!-- Form active or inactive -->
        <button
          class={`px-4 py-2 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
            formStatus === 'active' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'
          }`}
          on:click={toggleFormStatus}
        >
          {formStatus === 'active' ? 'Active' : 'Inactive'}
        </button>
        <button
          on:click={saveForm}
          class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          Save Template
        </button>
      </div>

      <!-- Form Builder Area -->
      <div class="flex-1 overflow-y-auto p-6">
        <div
          class="min-h-[calc(100vh-8rem)] border-2 border-dashed border-gray-300 rounded-lg p-6"
          on:dragover|preventDefault
          on:drop={handleDrop}
          use:dndzone={{items: fields}}
          on:consider={handleDndConsider}
          on:finalize={handleDndFinalize}
        >
          {#each fields as field (field.id)}
            <div
              animate:flip={{ duration: 300 }}
              class="mb-4 relative group"
              on:click={() => selectedField = field}
            >
              <div class="absolute -left-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  class="text-gray-400 hover:text-red-500"
                  on:click={() => removeField(field.id)}
                >
                  ×
                </button>
              </div>
              <div class="bg-white rounded-lg border-2 p-4" class:border-indigo-500={selectedField?.id === field.id} class:border-gray-200={selectedField?.id !== field.id}>
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-indigo-600">{fieldTypes[field.type].icon}</span>
                  <span class="font-medium">{field.properties.label}</span>
                </div>
    
                {#if field.type === 'input' || ['date', 'time', 'number', 'email', 'tel'].includes(field.type)}
                  <input
                    type={field.attributes.type || field.type}
                    placeholder={field.attributes.placeholder}
                    class="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                {:else if field.type === 'textarea'}
                  <textarea
                    placeholder={field.attributes.placeholder}
                    class="w-full px-3 py-2 border border-gray-300 rounded-md"
                  ></textarea>
                {:else if field.type === 'dropdown'}
                  <select class="w-full px-3 py-2 border border-gray-300 rounded-md">
                    {#each field.options || [] as option}
                      <option value={option.value}>{option.label}</option>
                    {/each}
                  </select>
                {:else if field.type === 'radio' || field.type === 'checkbox'}
                  <div class:flex={field.layout?.inline} class:gap-4={field.layout?.inline} class:space-y-2={!field.layout?.inline}>
                    {#each field.options || [] as option}
                      <label class="flex items-center gap-2">
                        <input
                          type={field.type}
                          name={field.properties.name}
                          value={option.value}
                        />
                        <span>{option.label}</span>
                      </label>
                    {/each}
                  </div>
                {:else if field.type === 'divider'}
                  <hr class="my-2 border-t border-gray-300" />
                {:else if field.type === 'title'}
                  <h3 class="text-lg font-semibold">{field.properties.label}</h3>
                {/if}
              </div>
            </div>
          {/each}
          {#if fields.length === 0}
            <div class="text-center text-gray-500 py-12">
              Drag and drop fields here or click on a field type to add
            </div>
          {/if}
        </div>
      </div>
    </div>
    <!-- Right Sidebar - Properties -->
    <div class="w-80 bg-white border-l border-gray-200 overflow-y-auto">
      <div class="p-6">
        <h2 class="text-lg font-semibold mb-6">Properties</h2>
        {#if selectedField}
          <div class="space-y-6" transition:fade>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  bind:value={selectedField.properties.name}
                  on:input={() => updateField(selectedField, 'properties.name', selectedField.properties.name)}
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Label
                </label>
                <input
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  bind:value={selectedField.properties.label}
                  on:input={() => updateField(selectedField, 'properties.label', selectedField.properties.label)}
                />
              </div>
              {#if selectedField.type === 'input'}
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Input Type
                  </label>
                  <select
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    bind:value={selectedField.attributes.type}
                    on:change={() => updateField(selectedField, 'attributes.type', selectedField.attributes.type)}
                  >
                    {#each inputTypes as type}
                      <option value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    {/each}
                  </select>
                </div>
              {/if}
              {#if ['input', 'textarea', 'date', 'time', 'number', 'email', 'tel'].includes(selectedField.type)}
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Placeholder
                  </label>
                  <input
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    bind:value={selectedField.attributes.placeholder}
                    on:input={() => updateField(selectedField, 'attributes.placeholder', selectedField.attributes.placeholder)}
                  />
                </div>
              {/if}
              {#if ['dropdown', 'radio', 'checkbox'].includes(selectedField.type)}
                <div>
                  <div class="flex justify-between items-center mb-2">
                    <label class="block text-sm font-medium text-gray-700">
                      Options
                    </label>
                    <button
                      class="text-sm text-indigo-600 hover:text-indigo-900"
                      on:click={() => addOption(selectedField)}
                    >
                      Add Option
                    </button>
                  </div>
    
                  {#each selectedField.options || [] as option, i}
                    <div class="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Label"
                        bind:value={option.label}
                        on:input={() => updateField(selectedField, 'options', selectedField.options)}
                      />
                      <input
                        type="text"
                        class="w-20 px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Value"
                        bind:value={option.value}
                        on:input={() => updateField(selectedField, 'options', selectedField.options)}
                      />
                      <button
                        class="text-gray-400 hover:text-red-500"
                        on:click={() => removeOption(selectedField, i)}
                      >
                        ×
                      </button>
                    </div>
                  {/each}
                  {#if ['radio', 'checkbox'].includes(selectedField.type)}
                    <div class="mt-4">
                      <label class="flex items-center gap-2">
                        <input
                          type="checkbox"
                          class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          bind:checked={selectedField.layout.inline}
                          on:change={() => updateField(selectedField, 'layout', selectedField.layout)}
                        />
                        <span class="text-sm text-gray-700">Inline layout</span>
                      </label>
                    </div>
                  {/if}
                </div>
              {/if}
              
              <!-- Validation Section -->
              <div class="mt-6">
                <h3 class="text-sm font-medium text-gray-700 mb-2">Validation</h3>
                <div class="space-y-2">
                  <label class="flex items-center gap-2">
                    <input
                      type="checkbox"
                      class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      bind:checked={selectedField.validation.required}
                      on:change={() => updateValidation(selectedField, 'required', selectedField.validation.required)}
                    />
                    <span class="text-sm text-gray-700">Required</span>
                  </label>
                  
                  {#if ['input', 'textarea'].includes(selectedField.type)}
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">
                        Min Length
                      </label>
                      <input
                        type="number"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        bind:value={selectedField.validation.minLength}
                        on:input={() => updateValidation(selectedField, 'minLength', selectedField.validation.minLength)}
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">
                        Max Length
                      </label>
                      <input
                        type="number"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        bind:value={selectedField.validation.maxLength}
                        on:input={() => updateValidation(selectedField, 'maxLength', selectedField.validation.maxLength)}
                      />
                    </div>
                  {/if}
                  
                  {#if selectedField.type === 'number' || (selectedField.type === 'input' && selectedField.attributes.type === 'number')}
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">
                        Min Value
                      </label>
                      <input
                        type="number"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        bind:value={selectedField.validation.min}
                        on:input={() => updateValidation(selectedField, 'min', selectedField.validation.min)}
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">
                        Max Value
                      </label>
                      <input
                        type="number"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        bind:value={selectedField.validation.max}
                        on:input={() => updateValidation(selectedField, 'max', selectedField.validation.max)}
                      />
                    </div>
                  {/if}
                  
                  {#if selectedField.type === 'email' || (selectedField.type === 'input' && selectedField.attributes.type === 'email')}
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">
                        Email Pattern
                      </label>
                      <input
                        type="text"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        bind:value={selectedField.validation.pattern}
                        on:input={() => updateValidation(selectedField, 'pattern', selectedField.validation.pattern)}
                        placeholder="e.g. [a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$"
                      />
                    </div>
                  {/if}
                </div>
              </div>
            </div>
          </div>
        {:else}
          <p class="text-gray-500">Select a field to edit its properties</p>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  :global(*) {
    user-select: none;
  }
  
  input[type="text"],
  input[type="number"],
  select {
    user-select: text;
  }
</style>