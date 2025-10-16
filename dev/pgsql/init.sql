-- Create databases
CREATE DATABASE "CORE_TEST";

-- Create user table in CORE db
\c CORE;

CREATE TABLE IF NOT EXISTS public.t_sys_users
(
    c_userid bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
    c_firstname character varying(35) COLLATE pg_catalog."default" NOT NULL,
    c_lastname character varying(35) COLLATE pg_catalog."default" NOT NULL,
    c_email character varying(100) COLLATE pg_catalog."default" NOT NULL,
    c_createdby bigint,
    c_createddate timestamp with time zone,
    c_updatedby bigint,
    c_updateddate timestamp with time zone,
    c_deletedby bigint,
    c_deleteddate timestamp with time zone,
    c_isroot boolean NOT NULL DEFAULT false,
    c_password text COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT t_sys_users_pkey PRIMARY KEY (c_userid),
    CONSTRAINT t_sys_users_unique_c_email UNIQUE (c_email)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.t_sys_users
    OWNER to postgres;

-- Create admin user for login
INSERT INTO public.t_sys_users(c_firstname, c_lastname, c_email, c_isroot, c_password) VALUES ('Admin', 'DoNotDelete', 'admin.donotdelete@email.com', true, '$2a$10$B1Lx2ZiPjdQ/AIjMVGRQi.i3grEWTtoo.fSYTPq3Gd7Z7KEHrM9LG')
ON CONFLICT (unique_column) DO NOTHING;

-- Create user table in CORE_TEST db
\c CORE_TEST;

CREATE TABLE IF NOT EXISTS public.t_sys_users
(
    c_userid bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
    c_firstname character varying(35) COLLATE pg_catalog."default" NOT NULL,
    c_lastname character varying(35) COLLATE pg_catalog."default" NOT NULL,
    c_email character varying(100) COLLATE pg_catalog."default" NOT NULL,
    c_createdby bigint,
    c_createddate timestamp with time zone,
    c_updatedby bigint,
    c_updateddate timestamp with time zone,
    c_deletedby bigint,
    c_deleteddate timestamp with time zone,
    c_isroot boolean NOT NULL DEFAULT false,
    c_password text COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT t_sys_users_pkey PRIMARY KEY (c_userid),
    CONSTRAINT t_sys_users_unique_c_email UNIQUE (c_email)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.t_sys_users
    OWNER to postgres;