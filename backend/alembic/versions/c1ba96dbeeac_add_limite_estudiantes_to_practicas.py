"""add_limite_estudiantes_to_practicas

Revision ID: c1ba96dbeeac
Revises: b4c9f7257505
Create Date: 2025-05-25 18:36:18.587653

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c1ba96dbeeac'
down_revision: Union[str, None] = 'b4c9f7257505'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.add_column('practicas', sa.Column('limite_estudiantes', sa.Integer(), nullable=False, server_default='1'))
    op.alter_column('practicas', 'limite_estudiantes', server_default=None)  # Quitar default luego del insert



def downgrade():
    op.drop_column('practicas', 'limite_estudiantes')
