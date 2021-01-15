/* eslint-disable func-names */
/* global _, typeList, typeChart */

jQuery(($) => {
    // Variables

    const $dropdowns = $('.pokemon-types select');
    const $items = $('.pokemon-item');
    const $team = $('.pokemon-team');

    // Calculate Defense Types

    function calculateDefenseTypes(arr) {
        const result = [];

        _.each(typeChart, (row, i) => {
            const name = typeList[i];
            let eff = 1;
            let count = 0;

            _.each(arr, (types) => {
                let tmp = 1;

                _.each(types, (type) => {
                    eff *= row[type];
                    tmp *= row[type];
                });

                if (tmp > 1) {
                    count += 1;
                } else if (tmp < 1) {
                    count -= 1;
                }
            });

            result.push({
                id: i,
                type: name,
                eff,
                count,
            });
        });

        return result;
    }

    // Show Weakness and Resistance

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

    function showWeakness(self, defense, team = false) {
        const weakness = _(defense)
            .filter((o) => (team ? o.count > 0 : o.eff > 1))
            .orderBy((o) => (team ? o.count : o.eff), 'desc')
            .value();

        let html = '';
        _.each(weakness, (o) => {
            html += `
                <span class="type type-${o.id}">
                    ${o.type}
                    <span class="badge badge-light">${team ? o.count : `${o.eff}×`}</span>
                </span>`;
        });

        $(self).find('.pokemon-weakness').html(html);
    }

    function showResistance(self, defense, team = false) {
        const resistance = _(defense)
            .filter((o) => (team ? o.count < 0 : o.eff < 1))
            .orderBy((o) => (team ? o.count : o.eff), 'asc')
            .value();

        let html = '';
        _.each(resistance, (o) => {
            html += `
                <span class="type type-${o.id}">
                    ${o.type}
                    <span class="badge badge-light">${team ? Math.abs(o.count) : `${o.eff}×`}</span>
                </span>`;
        });

        $(self).find('.pokemon-resistance').html(html);
    }

    // Events

    function onChangeType() {
        const team = [];

        $items.each(function () {
            let types = getTypesByItem(this);
            if (_.isEmpty(types)) {
                $(this).find('.pokemon-weakness').empty();
                $(this).find('.pokemon-resistance').empty();
                return;
            }

            types = _.uniq(types);
            team.push(types);
            const defense = calculateDefenseTypes([types]);
            showWeakness(this, defense);
            showResistance(this, defense);
        });

        if (_.isEmpty(team)) {
            $team.find('.pokemon-weakness').empty();
            $team.find('.pokemon-resistance').empty();
            return;
        }

        const defense = calculateDefenseTypes(team);
        showWeakness($team, defense, true);
        showResistance($team, defense, true);
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

    initDropdowns();
});
