const shadowDOM_tbr = dataBase.get('CreatePackageShadowDOM')('top-bar-right');
shadowDOM_tbr.host.style.display = 'flex';
shadowDOM_tbr.host.style.justifyContent = 'flex-start';
shadowDOM_tbr.host.order = '99999999';

const icon = document.createElement('div');

icon.style.backgroundImage = 'url(/packages/assets/built_in_tool/assets/image/package_icon.png)';
icon.style.backgroundSize = 'cover';
icon.style.margin = '6px';
icon.style.height = '36px';
icon.style.width = '36px';

shadowDOM_tbr.appendChild(icon);

const response = await fetch('/packages/assets/built_in_tool/assets/html/package.html');

let packageItem = null;

dataBase.get('SetSidePanelEvent')(icon, 'built_in_tool_package', 'Package', await response.text(), 400, 800,
    async doc => {
        list = await fetch('/packages', { method: "GET" }).then(response => response.json());

        const table = doc.querySelector('#package-table');

        for (const n of list) {
            const itme = document.createElement('div');

            itme.classList.add('package-item');
            itme.textContent = n;

            itme.addEventListener('click', e => {
                if (packageItem !== null)
                    packageItem.style.backgroundColor = 'var(--background-color)';

                packageItem = itme;
                packageItem.style.backgroundColor = 'var(--background-color-hover)';
            });

            table.appendChild(itme);
        }

        const input = doc.querySelector('#package-git-url');
        const inputExplain = doc.querySelector('#package-git-url-text');

        inputExplain.textContent = 'Enter the URL of the github repository you want to clone.';

        const addBtn = doc.querySelector('#package-add-btn');

        addBtn.addEventListener('click', async e => {
            if (!isValidUrl(input.value)) return;

            inputExplain.textContent = 'Downloading github repository.';

            const response = await fetch('/packages',
                {
                    method: "POST",
                    body: JSON.stringify({
                        url: input.value,
                    })
                });

            if (response.status === 200) {
                location.reload(true);
            }
        });

        const removeBtn = doc.querySelector("#package-remove-btn");

        removeBtn.addEventListener('click', async e => {
            if (packageItem === null) return;

            const response = await fetch(`/packages?name=${packageItem.textContent}`, { method: "DELETE" });

            if (response.status === 200) {
                packageItem.remove();
                packageItem = null;
            }
            else
                console.log(await response.text());
        });
    }, null);