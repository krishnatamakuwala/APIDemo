import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import { Search } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { useState } from 'react';

export default function SearchBar(props: ISearchBarProps) {
    
    const [search, setSearch] = useState<string>("");

    return (
        <Paper
            component="form"
            sx={{ p: '6px 6px 6px 16px', display: 'flex', alignItems: 'center', width: "100%" }}
        >
            <InputBase
                id="search"
                sx={{ ml: 1, flex: 1 }}
                placeholder={props.placeHolder}
                inputProps={{ 'aria-label': props.placeHolder.toLowerCase() }}
                onChange={(e) => {
                    setSearch(e.target.value);
                }}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        if (typeof props.onSearch === "function") {
                            props.onSearch(search);
                        }
                    }
                }}
            />
            <IconButton
                type="button"
                sx={{ p: '10px' }}
                aria-label="search"
                onClick={() => {
                    if (typeof props.onSearch === "function") {
                        props.onSearch(search);
                    }
                }}
            >
                <Search color='action' />
            </IconButton>
        </Paper>
    );
}

interface ISearchBarProps {
    placeHolder: string;
    onSearch?: (value: string) => void;
}