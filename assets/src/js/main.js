/* eslint-disable func-names */
/* global _, typeList, typeChart */

jQuery(($) => {
    // Variables

    const $dropdowns = $('.pokemon-types select');
    const $items = $('.pokemon-item');

    // Calculate Defense Types

    function calculateDefenseTypes(types) {
        const result = [];

        for (let i = 0; i < typeChart.length; i += 1) {
            const name = typeList[i];
            let eff = 1;
            let count = 0;

            _.map(types, (type) => {
                const value = typeChart[i][type];
                eff *= value;

                if (value > 1) {
                    count += 1;
                } else if (value < 1) {
                    count -= 1;
                }
            });

            result.push({
                id: i,
                type: name,
                eff,
                count: Math.abs(count),
            });
        }

        return result;
    }

    // Calculate Weakness and Resistance

    function getTypesByItem(self) {
        const types = [];

        const type1 = $(self).find('.pokemon-type1').val();
        if (type1) {
            types.push(type1);
        }

        const type2 = $(self).find('.pokemon-type2').val();
        if (type2) {
            types.push(type2);
        }

        return types;
    }

    function showPokemonWeakness(self, defense) {
        const weakness = _(defense)
            .filter((o) => o.eff > 1)
            .orderBy('eff', 'desc')
            .value();

        let html = '';
        _.map(weakness, (o) => {
            html += `<span class="type type-${o.id}">${o.type} <span class="badge badge-light">${o.eff}×</span></span>`;
        });

        $(self).find('.pokemon-weakness').html(html);
    }

    function showPokemonResistance(self, defense) {
        const resistance = _(defense)
            .filter((o) => o.eff < 1)
            .orderBy('eff', 'desc')
            .value();

        let html = '';
        _.map(resistance, (o) => {
            html += `<span class="type type-${o.id}">${o.type} <span class="badge badge-light">${o.eff}×</span></span>`;
        });

        $(self).find('.pokemon-resistance').html(html);
    }

    function calculateWeaknessAndResistance() {
        $items.each(function () {
            let types = getTypesByItem(this);
            if (_.isEmpty(types)) {
                $(this).find('.pokemon-weakness').empty();
                $(this).find('.pokemon-resistance').empty();
                return;
            }

            types = _.uniq(types);
            const defense = calculateDefenseTypes(types);
            showPokemonWeakness(this, defense);
            showPokemonResistance(this, defense);
        });
    }

    // Events

    function onChangeType() {
        calculateWeaknessAndResistance();
    }

    function initDropdowns() {
        $dropdowns.each(function () {
            const options = _(typeList)
                .map((v, i) => ({ value: i, text: v }))
                .value();
            options.unshift({ value: '', text: 'None' });
            $(this).htmlOptions(options);
            $(this).on('change', onChangeType);
        });
    }

    function init() {
        initDropdowns();
    }

    init();
});
