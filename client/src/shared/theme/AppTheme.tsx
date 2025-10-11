'use client';

// import * as React from 'react';
import { createTheme } from '@mui/material/styles';
// import type { ThemeOptions } from '@mui/material/styles';
import { inputsCustomizations } from './customs/Inputs';
import { dataDisplayCustomizations } from './customs/DataDisplay';
import { dataGridCustomizations } from './customs/DataGrid';
import { feedbackCustomizations } from './customs/Feedback';
import { navigationCustomizations } from './customs/Navigation';
import { surfacesCustomizations } from './customs/Surfaces';
import { colorSchemes, typography, shadows, shape } from './themePrimitives';

// interface AppThemeProps {
//     children: React.ReactNode;
//     /**
//      * This is for the docs site. You can ignore it or remove it.
//      */
//     disableCustomTheme?: boolean;
//     themeComponents?: ThemeOptions['components'];
// }

    const theme = createTheme({
                // For more details about CSS variables configuration, see https://mui.com/material-ui/customization/css-theme-variables/configuration/
                cssVariables: {
                    colorSchemeSelector: 'data-mui-color-scheme',
                    cssVarPrefix: 'template',
                },
                colorSchemes, // Recently added in v6 for building light & dark mode app, see https://mui.com/material-ui/customization/palette/#color-schemes
                typography,
                shadows,
                shape,
                components: {
                    ...inputsCustomizations,
                    ...dataDisplayCustomizations,
                    ...feedbackCustomizations,
                    ...navigationCustomizations,
                    ...surfacesCustomizations,
                    ...dataGridCustomizations,
                },
            });

        export default theme;
